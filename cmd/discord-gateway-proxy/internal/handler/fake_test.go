package handler

import "github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"

// fakeEnqueuer records every event handed to it, so tests can assert on the
// pipeline.Events a handler produces without a real pipeline.Client.
type fakeEnqueuer struct {
	events []pipeline.Event
}

func (f *fakeEnqueuer) Enqueue(event pipeline.Event) {
	f.events = append(f.events, event)
}
