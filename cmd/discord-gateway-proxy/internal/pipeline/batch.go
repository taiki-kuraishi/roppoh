package pipeline

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"
)

// run batches records off the queue and flushes them on size or interval
// thresholds until Shutdown closes the queue.
func (c *Client[T]) run() {
	defer close(c.done)

	ticker := time.NewTicker(c.flushInterval)
	defer ticker.Stop()

	batch := make([]T, 0, c.batchSize)
	for {
		select {
		case record, ok := <-c.queue:
			if !ok {
				c.flush(batch)
				return
			}

			batch = append(batch, record)
			if len(batch) >= c.batchSize {
				batch = c.flushAndReset(batch)
			}

		case <-ticker.C:
			batch = c.flushAndReset(batch)
		}
	}
}

// flushAndReset sends batch if non-empty and returns a fresh slice reusing
// its capacity.
func (c *Client[T]) flushAndReset(batch []T) []T {
	c.flush(batch)
	return batch[:0]
}

// flush POSTs batch to the ingest endpoint as a JSON array. Failures are
// logged, not retried: losing a batch of presence/voice telemetry is
// acceptable, blocking the process is not.
func (c *Client[T]) flush(batch []T) {
	if len(batch) == 0 {
		return
	}

	body, err := json.Marshal(batch)
	if err != nil {
		c.logger.Error("marshal pipeline batch", slog.String("stream", c.name), slog.String("error", err.Error()))
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), sendTimeout)
	defer cancel()

	if err := c.send(ctx, body); err != nil {
		c.logger.Error("send pipeline batch",
			slog.String("stream", c.name),
			slog.Int("record_count", len(batch)),
			slog.String("error", err.Error()),
		)
	}
}

// send performs the HTTP POST to the ingest endpoint.
func (c *Client[T]) send(ctx context.Context, body []byte) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.token)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("do request: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("unexpected status: %s", resp.Status)
	}

	return nil
}
