package config

import (
	"errors"
	"testing"
)

func TestLoad(t *testing.T) {
	t.Run("missing token", func(t *testing.T) {
		t.Setenv("DISCORD_BOT_TOKEN", "")
		if _, err := Load(); !errors.Is(err, ErrMissingBotToken) {
			t.Fatalf("Load() error = %v, want ErrMissingBotToken", err)
		}
	})

	t.Run("token is trimmed", func(t *testing.T) {
		t.Setenv("DISCORD_BOT_TOKEN", "  secret-token  ")

		cfg, err := Load()
		if err != nil {
			t.Fatalf("Load() error = %v", err)
		}
		if cfg.BotToken != "secret-token" {
			t.Errorf("BotToken = %q, want %q", cfg.BotToken, "secret-token")
		}
	})
}
