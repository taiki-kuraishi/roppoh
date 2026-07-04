package pipeline

import (
	"context"
	"log/slog"
	"net/http"
	"time"
)

const (
	// defaultBatchSize caps how many events accumulate before a batch is sent
	// early, staying well under the Pipelines 5 MB per-request ingest limit.
	defaultBatchSize = 100
	// defaultFlushInterval bounds how long an event can sit buffered before
	// being sent, even if defaultBatchSize hasn't been reached.
	defaultFlushInterval = 5 * time.Second
	// defaultQueueSize is the channel buffer; once full, Enqueue drops events
	// instead of blocking the discordgo event-dispatch goroutine.
	defaultQueueSize = 1000
	// sendTimeout bounds a single HTTP POST to the ingest endpoint.
	sendTimeout = 10 * time.Second
)

// Client buffers Events and flushes them as JSON array batches to a
// Cloudflare Pipelines HTTP ingest endpoint.
type Client struct {
	endpoint      string
	token         string
	httpClient    *http.Client
	logger        *slog.Logger
	batchSize     int
	flushInterval time.Duration

	queue chan Event
	done  chan struct{}
}

// New creates a Client and starts its background batching goroutine. Callers
// must call Shutdown to flush buffered events before the process exits.
func New(endpoint, token string, logger *slog.Logger) *Client {
	return newClient(endpoint, token, logger, defaultBatchSize, defaultFlushInterval, defaultQueueSize)
}

// newClient is the fully-parameterized constructor used by New and by tests
// that need a smaller batch size, interval, or queue to stay fast.
func newClient(endpoint, token string, logger *slog.Logger, batchSize int, flushInterval time.Duration, queueSize int) *Client {
	c := &Client{
		endpoint:      endpoint,
		token:         token,
		httpClient:    &http.Client{Timeout: sendTimeout},
		logger:        logger,
		batchSize:     batchSize,
		flushInterval: flushInterval,
		queue:         make(chan Event, queueSize),
		done:          make(chan struct{}),
	}

	go c.run()

	return c
}

// Enqueue buffers an event for delivery. It never blocks: if the internal
// queue is full, the event is dropped and logged, protecting discordgo's
// event-dispatch goroutine from backpressure.
func (c *Client) Enqueue(event Event) {
	select {
	case c.queue <- event:
	default:
		c.logger.Warn("pipeline queue full, dropping event", slog.String("event_type", event.EventType))
	}
}

// Shutdown stops accepting new events, flushes any buffered ones, and waits
// for the background goroutine to exit or ctx to be done.
func (c *Client) Shutdown(ctx context.Context) error {
	close(c.queue)

	select {
	case <-c.done:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}
