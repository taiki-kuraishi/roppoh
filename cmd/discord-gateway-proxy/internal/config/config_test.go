package config

import (
	"errors"
	"testing"
)

func setValidEnv(t *testing.T) {
	t.Helper()
	t.Setenv("DISCORD_BOT_TOKEN", "bot-token")
	t.Setenv("PRESENCE_UPDATE_INGEST_ENDPOINT", "https://presence.ingest.cloudflare.com")
	t.Setenv("GUILD_PRESENCE_SNAPSHOT_INGEST_ENDPOINT", "https://snapshot.ingest.cloudflare.com")
	t.Setenv("VOICE_STATE_UPDATE_INGEST_ENDPOINT", "https://voice.ingest.cloudflare.com")
	t.Setenv("PIPELINE_API_TOKEN", "pipeline-token")
}

func TestLoad(t *testing.T) {
	t.Run("missing bot token", func(t *testing.T) {
		setValidEnv(t)
		t.Setenv("DISCORD_BOT_TOKEN", "")

		if _, err := Load(); !errors.Is(err, ErrMissingBotToken) {
			t.Fatalf("Load() error = %v, want ErrMissingBotToken", err)
		}
	})

	t.Run("missing presence update endpoint", func(t *testing.T) {
		setValidEnv(t)
		t.Setenv("PRESENCE_UPDATE_INGEST_ENDPOINT", "")

		if _, err := Load(); !errors.Is(err, ErrMissingPresenceUpdateEndpoint) {
			t.Fatalf("Load() error = %v, want ErrMissingPresenceUpdateEndpoint", err)
		}
	})

	t.Run("missing guild presence snapshot endpoint", func(t *testing.T) {
		setValidEnv(t)
		t.Setenv("GUILD_PRESENCE_SNAPSHOT_INGEST_ENDPOINT", "")

		if _, err := Load(); !errors.Is(err, ErrMissingGuildPresenceSnapshotEndpoint) {
			t.Fatalf("Load() error = %v, want ErrMissingGuildPresenceSnapshotEndpoint", err)
		}
	})

	t.Run("missing voice state update endpoint", func(t *testing.T) {
		setValidEnv(t)
		t.Setenv("VOICE_STATE_UPDATE_INGEST_ENDPOINT", "")

		if _, err := Load(); !errors.Is(err, ErrMissingVoiceStateUpdateEndpoint) {
			t.Fatalf("Load() error = %v, want ErrMissingVoiceStateUpdateEndpoint", err)
		}
	})

	t.Run("missing pipeline api token", func(t *testing.T) {
		setValidEnv(t)
		t.Setenv("PIPELINE_API_TOKEN", "")

		if _, err := Load(); !errors.Is(err, ErrMissingPipelineAPIToken) {
			t.Fatalf("Load() error = %v, want ErrMissingPipelineAPIToken", err)
		}
	})

	t.Run("values are trimmed", func(t *testing.T) {
		t.Setenv("DISCORD_BOT_TOKEN", "  secret-token  ")
		t.Setenv("PRESENCE_UPDATE_INGEST_ENDPOINT", "  https://presence.ingest.cloudflare.com  ")
		t.Setenv("GUILD_PRESENCE_SNAPSHOT_INGEST_ENDPOINT", "  https://snapshot.ingest.cloudflare.com  ")
		t.Setenv("VOICE_STATE_UPDATE_INGEST_ENDPOINT", "  https://voice.ingest.cloudflare.com  ")
		t.Setenv("PIPELINE_API_TOKEN", "  pipeline-token  ")

		cfg, err := Load()
		if err != nil {
			t.Fatalf("Load() error = %v", err)
		}
		if cfg.BotToken != "secret-token" {
			t.Errorf("BotToken = %q, want %q", cfg.BotToken, "secret-token")
		}
		if cfg.PresenceUpdateEndpoint != "https://presence.ingest.cloudflare.com" {
			t.Errorf("PresenceUpdateEndpoint = %q, want %q", cfg.PresenceUpdateEndpoint, "https://presence.ingest.cloudflare.com")
		}
		if cfg.GuildPresenceSnapshotEndpoint != "https://snapshot.ingest.cloudflare.com" {
			t.Errorf("GuildPresenceSnapshotEndpoint = %q, want %q", cfg.GuildPresenceSnapshotEndpoint, "https://snapshot.ingest.cloudflare.com")
		}
		if cfg.VoiceStateUpdateEndpoint != "https://voice.ingest.cloudflare.com" {
			t.Errorf("VoiceStateUpdateEndpoint = %q, want %q", cfg.VoiceStateUpdateEndpoint, "https://voice.ingest.cloudflare.com")
		}
		if cfg.PipelineAPIToken != "pipeline-token" {
			t.Errorf("PipelineAPIToken = %q, want %q", cfg.PipelineAPIToken, "pipeline-token")
		}
	})
}
