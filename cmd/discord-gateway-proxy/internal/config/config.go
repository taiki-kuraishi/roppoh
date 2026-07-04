// Package config loads runtime configuration for discord-gateway-proxy from the
// process environment.
package config

import (
	"errors"
	"os"
	"strings"
)

// Config holds the runtime configuration resolved from environment variables.
type Config struct {
	// BotToken is the Discord bot token used to authenticate the gateway connection.
	BotToken string
	// PresenceUpdateEndpoint is the Cloudflare Pipelines HTTP ingest endpoint
	// for live PresenceUpdate records (presence_update_events table).
	PresenceUpdateEndpoint string
	// GuildPresenceSnapshotEndpoint is the ingest endpoint for the
	// GuildCreate startup presence snapshot (guild_presence_snapshot_events
	// table).
	GuildPresenceSnapshotEndpoint string
	// VoiceStateUpdateEndpoint is the ingest endpoint for VoiceStateUpdate
	// records (voice_state_update_events table).
	VoiceStateUpdateEndpoint string
	// PipelineAPIToken authenticates requests to all three ingest endpoints
	// above (requires the account-scoped Pipelines Send permission).
	PipelineAPIToken string
}

// ErrMissingBotToken is returned by Load when DISCORD_BOT_TOKEN is unset or empty.
var ErrMissingBotToken = errors.New("DISCORD_BOT_TOKEN is required")

// ErrMissingPresenceUpdateEndpoint is returned by Load when
// PRESENCE_UPDATE_INGEST_ENDPOINT is unset or empty.
var ErrMissingPresenceUpdateEndpoint = errors.New("PRESENCE_UPDATE_INGEST_ENDPOINT is required")

// ErrMissingGuildPresenceSnapshotEndpoint is returned by Load when
// GUILD_PRESENCE_SNAPSHOT_INGEST_ENDPOINT is unset or empty.
var ErrMissingGuildPresenceSnapshotEndpoint = errors.New("GUILD_PRESENCE_SNAPSHOT_INGEST_ENDPOINT is required")

// ErrMissingVoiceStateUpdateEndpoint is returned by Load when
// VOICE_STATE_UPDATE_INGEST_ENDPOINT is unset or empty.
var ErrMissingVoiceStateUpdateEndpoint = errors.New("VOICE_STATE_UPDATE_INGEST_ENDPOINT is required")

// ErrMissingPipelineAPIToken is returned by Load when PIPELINE_API_TOKEN is unset
// or empty.
var ErrMissingPipelineAPIToken = errors.New("PIPELINE_API_TOKEN is required")

// Load reads configuration from the process environment. Every field is required.
func Load() (Config, error) {
	botToken, err := requireEnv("DISCORD_BOT_TOKEN", ErrMissingBotToken)
	if err != nil {
		return Config{}, err
	}

	presenceUpdateEndpoint, err := requireEnv("PRESENCE_UPDATE_INGEST_ENDPOINT", ErrMissingPresenceUpdateEndpoint)
	if err != nil {
		return Config{}, err
	}

	guildPresenceSnapshotEndpoint, err := requireEnv("GUILD_PRESENCE_SNAPSHOT_INGEST_ENDPOINT", ErrMissingGuildPresenceSnapshotEndpoint)
	if err != nil {
		return Config{}, err
	}

	voiceStateUpdateEndpoint, err := requireEnv("VOICE_STATE_UPDATE_INGEST_ENDPOINT", ErrMissingVoiceStateUpdateEndpoint)
	if err != nil {
		return Config{}, err
	}

	pipelineAPIToken, err := requireEnv("PIPELINE_API_TOKEN", ErrMissingPipelineAPIToken)
	if err != nil {
		return Config{}, err
	}

	return Config{
		BotToken:                      botToken,
		PresenceUpdateEndpoint:        presenceUpdateEndpoint,
		GuildPresenceSnapshotEndpoint: guildPresenceSnapshotEndpoint,
		VoiceStateUpdateEndpoint:      voiceStateUpdateEndpoint,
		PipelineAPIToken:              pipelineAPIToken,
	}, nil
}

// requireEnv trims and returns the named environment variable, or missingErr if
// it is unset or empty after trimming.
func requireEnv(name string, missingErr error) (string, error) {
	value := strings.TrimSpace(os.Getenv(name))
	if value == "" {
		return "", missingErr
	}

	return value, nil
}
