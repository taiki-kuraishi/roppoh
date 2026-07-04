package config

import (
	"errors"
	"testing"
)

func setValidEnv(t *testing.T) {
	t.Helper()
	t.Setenv("DISCORD_BOT_TOKEN", "bot-token")
	t.Setenv("PIPELINE_INGEST_ENDPOINT", "https://stream-id.ingest.cloudflare.com")
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

	t.Run("missing pipeline endpoint", func(t *testing.T) {
		setValidEnv(t)
		t.Setenv("PIPELINE_INGEST_ENDPOINT", "")

		if _, err := Load(); !errors.Is(err, ErrMissingPipelineEndpoint) {
			t.Fatalf("Load() error = %v, want ErrMissingPipelineEndpoint", err)
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
		t.Setenv("PIPELINE_INGEST_ENDPOINT", "  https://stream-id.ingest.cloudflare.com  ")
		t.Setenv("PIPELINE_API_TOKEN", "  pipeline-token  ")

		cfg, err := Load()
		if err != nil {
			t.Fatalf("Load() error = %v", err)
		}
		if cfg.BotToken != "secret-token" {
			t.Errorf("BotToken = %q, want %q", cfg.BotToken, "secret-token")
		}
		if cfg.PipelineEndpoint != "https://stream-id.ingest.cloudflare.com" {
			t.Errorf("PipelineEndpoint = %q, want %q", cfg.PipelineEndpoint, "https://stream-id.ingest.cloudflare.com")
		}
		if cfg.PipelineAPIToken != "pipeline-token" {
			t.Errorf("PipelineAPIToken = %q, want %q", cfg.PipelineAPIToken, "pipeline-token")
		}
	})
}
