// Package handler translates Discord gateway events relevant to
// activity/presence tracking into pipeline.Events and enqueues them for
// delivery to Cloudflare Pipelines.
package handler

import (
	"log/slog"

	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"
)

// Enqueuer buffers a pipeline.Event for asynchronous delivery. It is
// satisfied by *pipeline.Client; the interface exists so this package
// depends only on pipeline's public contract, not its internals.
type Enqueuer interface {
	Enqueue(event pipeline.Event)
}

// Handlers returns the discordgo event handlers that translate gateway
// events relevant to activity/presence tracking into pipeline.Events. Pass
// the result to gateway.NewSession, which registers each handler with
// session.AddHandler.
func Handlers(enq Enqueuer, logger *slog.Logger) []any {
	return []any{
		newPresenceHandler(enq),
		newGuildCreateHandler(enq, logger),
		newVoiceStateHandler(enq),
	}
}
