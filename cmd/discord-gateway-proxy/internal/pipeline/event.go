// Package pipeline sends structured Discord gateway events to a Cloudflare
// Pipelines HTTP ingest endpoint, buffering and batching them so gateway
// event handlers never block on network I/O.
package pipeline

import "time"

// Event is the envelope written to the Cloudflare Pipelines stream. Payload
// carries a handler-specific, already-normalized struct (see
// internal/handler) so the wire schema stays stable even as discordgo's own
// event types evolve.
type Event struct {
	EventType  string    `json:"event_type"`
	ReceivedAt time.Time `json:"received_at"`
	GuildID    string    `json:"guild_id,omitempty"`
	UserID     string    `json:"user_id,omitempty"`
	Payload    any       `json:"payload"`
}
