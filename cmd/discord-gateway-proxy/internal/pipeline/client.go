package pipeline

import (
	"context"
	"log/slog"
	"net/http"
	"time"
)

const (
	// defaultBatchSize caps how many records accumulate before a batch is
	// sent early, staying well under the Pipelines 5 MB per-request ingest
	// limit.
	defaultBatchSize = 100
	// defaultFlushInterval bounds how long a record can sit buffered before
	// being sent, even if defaultBatchSize hasn't been reached.
	defaultFlushInterval = 5 * time.Second
	// defaultQueueSize is the channel buffer; once full, Enqueue drops
	// records instead of blocking the discordgo event-dispatch goroutine.
	defaultQueueSize = 1000
	// sendTimeout bounds a single HTTP POST to the ingest endpoint.
	sendTimeout = 10 * time.Second
)

// Shutdowner is the type-erased half of Client's contract, letting callers
// collect Client[T] instances of different T into a single slice to shut
// down together.
type Shutdowner interface {
	Shutdown(ctx context.Context) error
}

// Client buffers records of a single type T and flushes them as JSON array
// batches to a Cloudflare Pipelines HTTP ingest endpoint. One Client maps to
// exactly one stream/table, which is what lets T stay a concrete type
// instead of "any": the compiler rejects enqueuing the wrong record shape
// into the wrong table.
type Client[T any] struct {
	// name identifies this client in logs (e.g. "presence_update"); it does
	// not affect the wire format.
	name          string
	endpoint      string
	token         string
	httpClient    *http.Client
	logger        *slog.Logger
	batchSize     int
	flushInterval time.Duration

	queue chan T
	done  chan struct{}
}

// New creates a Client and starts its background batching goroutine. Callers
// must call Shutdown to flush buffered records before the process exits.
func New[T any](name, endpoint, token string, logger *slog.Logger) *Client[T] {
	return newClient[T](name, endpoint, token, logger, defaultBatchSize, defaultFlushInterval, defaultQueueSize)
}

// newClient is the fully-parameterized constructor used by New and by tests
// that need a smaller batch size, interval, or queue to stay fast.
func newClient[T any](name, endpoint, token string, logger *slog.Logger, batchSize int, flushInterval time.Duration, queueSize int) *Client[T] {
	c := &Client[T]{
		name:          name,
		endpoint:      endpoint,
		token:         token,
		httpClient:    &http.Client{Timeout: sendTimeout},
		logger:        logger,
		batchSize:     batchSize,
		flushInterval: flushInterval,
		queue:         make(chan T, queueSize),
		done:          make(chan struct{}),
	}

	go c.run()

	return c
}

// Enqueue buffers a record for delivery. It never blocks: if the internal
// queue is full, the record is dropped and logged, protecting discordgo's
// event-dispatch goroutine from backpressure.
func (c *Client[T]) Enqueue(record T) {
	select {
	case c.queue <- record:
	default:
		c.logger.Warn("pipeline queue full, dropping record", slog.String("stream", c.name))
	}
}

// Shutdown stops accepting new records, flushes any buffered ones, and waits
// for the background goroutine to exit or ctx to be done.
func (c *Client[T]) Shutdown(ctx context.Context) error {
	close(c.queue)

	select {
	case <-c.done:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}
