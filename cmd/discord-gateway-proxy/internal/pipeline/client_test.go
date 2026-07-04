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
	received := make(chan []VoiceRecord, 1)

	server := httptest.NewServer(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		gotAuth = r.Header.Get("Authorization")

		var records []VoiceRecord
		if err := json.NewDecoder(r.Body).Decode(&records); err != nil {
			t.Errorf("decode request body: %v", err)
			return
		}
		received <- records
	}))
	defer server.Close()

	client := New[VoiceRecord]("voice_state_update", server.URL, "test-token", newTestLogger())
	client.Enqueue(VoiceRecord{
		ReceivedAt: time.Now(),
		UserID:     "user-1",
		ChannelID:  "channel-1",
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Shutdown(ctx); err != nil {
		t.Fatalf("Shutdown() error = %v", err)
	}

	select {
	case records := <-received:
		if len(records) != 1 {
			t.Fatalf("received %d records, want 1", len(records))
		}
		if records[0].UserID != "user-1" {
			t.Errorf("UserID = %q, want %q", records[0].UserID, "user-1")
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
	client := newClient[VoiceRecord]("voice_state_update", server.URL, "test-token", newTestLogger(), 2, time.Hour, 10)

	client.Enqueue(VoiceRecord{UserID: "a", ReceivedAt: time.Now()})
	client.Enqueue(VoiceRecord{UserID: "b", ReceivedAt: time.Now()})

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

	client := newClient[VoiceRecord]("voice_state_update", server.URL, "test-token", newTestLogger(), 1, time.Hour, 1)

	done := make(chan struct{})
	go func() {
		for range 10 {
			client.Enqueue(VoiceRecord{UserID: "user", ReceivedAt: time.Now()})
		}
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("Enqueue blocked despite a full queue")
	}
}
