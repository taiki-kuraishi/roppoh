package pipeline

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"
)

func newTestLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}

func TestClient_EnqueueAndShutdownFlushes(t *testing.T) {
	var gotAuth string
	received := make(chan []Event, 1)

	server := httptest.NewServer(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		gotAuth = r.Header.Get("Authorization")

		var events []Event
		if err := json.NewDecoder(r.Body).Decode(&events); err != nil {
			t.Errorf("decode request body: %v", err)
			return
		}
		received <- events
	}))
	defer server.Close()

	client := New(server.URL, "test-token", newTestLogger())
	client.Enqueue(Event{
		EventType:  "PRESENCE_UPDATE",
		ReceivedAt: time.Now(),
		Payload:    map[string]string{"status": "online"},
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Shutdown(ctx); err != nil {
		t.Fatalf("Shutdown() error = %v", err)
	}

	select {
	case events := <-received:
		if len(events) != 1 {
			t.Fatalf("received %d events, want 1", len(events))
		}
		if events[0].EventType != "PRESENCE_UPDATE" {
			t.Errorf("EventType = %q, want %q", events[0].EventType, "PRESENCE_UPDATE")
		}
	default:
		t.Fatal("server did not receive a request before Shutdown returned")
	}

	if want := "Bearer test-token"; gotAuth != want {
		t.Errorf("Authorization header = %q, want %q", gotAuth, want)
	}
}

func TestClient_FlushesEarlyAtBatchSize(t *testing.T) {
	var requestCount int32
	server := httptest.NewServer(http.HandlerFunc(func(_ http.ResponseWriter, _ *http.Request) {
		atomic.AddInt32(&requestCount, 1)
	}))
	defer server.Close()

	// A long flush interval means the only way a batch is sent before
	// Shutdown is the batchSize=2 threshold.
	client := newClient(server.URL, "test-token", newTestLogger(), 2, time.Hour, 10)

	client.Enqueue(Event{EventType: "A", ReceivedAt: time.Now()})
	client.Enqueue(Event{EventType: "B", ReceivedAt: time.Now()})

	deadline := time.Now().Add(2 * time.Second)
	for atomic.LoadInt32(&requestCount) == 0 {
		if time.Now().After(deadline) {
			t.Fatal("batch was not flushed after reaching the batch size")
		}
		time.Sleep(10 * time.Millisecond)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Shutdown(ctx); err != nil {
		t.Fatalf("Shutdown() error = %v", err)
	}
}

func TestClient_EnqueueDoesNotBlockWhenQueueFull(t *testing.T) {
	block := make(chan struct{})
	defer close(block)

	server := httptest.NewServer(http.HandlerFunc(func(_ http.ResponseWriter, _ *http.Request) {
		<-block // hold the batching goroutine so the queue backs up behind it
	}))
	defer server.Close()

	client := newClient(server.URL, "test-token", newTestLogger(), 1, time.Hour, 1)

	done := make(chan struct{})
	go func() {
		for range 10 {
			client.Enqueue(Event{EventType: "event", ReceivedAt: time.Now()})
		}
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("Enqueue blocked despite a full queue")
	}
}
