// Package pipeline sends flat, per-table records to Cloudflare Pipelines HTTP
// ingest endpoints, buffering and batching them so gateway event handlers
// never block on network I/O.
package pipeline

import "time"

// PresenceRecord is a single row for the presence_update_events and
// guild_presence_snapshot_events tables. It is intentionally flat (no JSON
// payload column) so the Iceberg table can be filtered/grouped on directly.
//
// A discordgo.Presence with N activities is expanded into N PresenceRecords
// upstream (see internal/handler), one per activity, because Cloudflare
// Pipelines SQL has no UNNEST to flatten arrays at query time. A presence
// with zero activities becomes a single record with the Activity* fields
// left nil.
type PresenceRecord struct {
	ReceivedAt    time.Time `json:"received_at"`
	GuildID       string    `json:"guild_id"`
	UserID        string    `json:"user_id"`
	Status        string    `json:"status"`
	ClientDesktop string    `json:"client_desktop"`
	ClientMobile  string    `json:"client_mobile"`
	ClientWeb     string    `json:"client_web"`

	// Activity* are pointers, not omitempty strings/ints: ActivityType==0 is
	// a valid value (discordgo.ActivityTypeGame), so nil must be
	// distinguishable from the zero value to land as SQL NULL rather than 0.
	ActivityName    *string `json:"activity_name"`
	ActivityType    *int    `json:"activity_type"`
	ActivityState   *string `json:"activity_state"`
	ActivityDetails *string `json:"activity_details"`
}

// VoiceRecord is a single row for the voice_state_update_events table.
// ChannelID is empty when the update represents a member leaving voice
// entirely.
type VoiceRecord struct {
	ReceivedAt time.Time `json:"received_at"`
	GuildID    string    `json:"guild_id"`
	UserID     string    `json:"user_id"`
	ChannelID  string    `json:"channel_id"`
	SessionID  string    `json:"session_id"`
	SelfMute   bool      `json:"self_mute"`
	SelfDeaf   bool      `json:"self_deaf"`
	Mute       bool      `json:"mute"`
	Deaf       bool      `json:"deaf"`
}
