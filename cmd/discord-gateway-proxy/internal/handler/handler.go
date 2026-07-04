// Package handler translates Discord gateway events relevant to
// activity/presence tracking into flat pipeline records and enqueues them
// for delivery to Cloudflare Pipelines.
package handler

import (
	"log/slog"

	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"
)

// Enqueuer buffers a record of type T for asynchronous delivery to a single
// Pipelines stream. It is satisfied by *pipeline.Client[T]; the interface
// exists so this package depends only on pipeline's public contract, not its
// internals.
type Enqueuer[T any] interface {
	Enqueue(record T)
}

// Enqueuers groups the per-table send targets. Presence and Snapshot share
// the exact same record type (pipeline.PresenceRecord), so they are passed
// as named fields rather than positional arguments: a positional signature
// would let a caller silently swap live presence updates and guild-create
// snapshots into the wrong table.
type Enqueuers struct {
	Presence Enqueuer[pipeline.PresenceRecord]
	Snapshot Enqueuer[pipeline.PresenceRecord]
	Voice    Enqueuer[pipeline.VoiceRecord]
}

// Handlers returns the discordgo event handlers that translate gateway
// events relevant to activity/presence tracking into pipeline records. Pass
// the result to gateway.NewSession, which registers each handler with
// session.AddHandler.
func Handlers(enq Enqueuers, logger *slog.Logger) []any {
	return []any{
		newPresenceHandler(enq.Presence),
		newGuildCreateHandler(enq.Snapshot, logger),
		newVoiceStateHandler(enq.Voice),
	}
}
