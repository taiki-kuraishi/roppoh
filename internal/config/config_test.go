package config

import (
	"errors"
	"log/slog"
	"testing"
)

func TestParseLogLevel(t *testing.T) {
	cases := []struct {
		in   string
		want slog.Level
	}{
		{"debug", slog.LevelDebug},
		{"DEBUG", slog.LevelDebug},
		{"info", slog.LevelInfo},
		{"warn", slog.LevelWarn},
		{"warning", slog.LevelWarn},
		{"error", slog.LevelError},
		{"  Error  ", slog.LevelError},
		{"", slog.LevelInfo},
		{"bogus", slog.LevelInfo},
	}

	for _, c := range cases {
		if got := parseLogLevel(c.in); got != c.want {
			t.Errorf("parseLogLevel(%q) = %v, want %v", c.in, got, c.want)
		}
	}
}

func TestLoad(t *testing.T) {
	t.Run("missing token", func(t *testing.T) {
		t.Setenv("DISCORD_BOT_TOKEN", "")
		if _, err := Load(); !errors.Is(err, ErrMissingBotToken) {
			t.Fatalf("Load() error = %v, want ErrMissingBotToken", err)
		}
	})

	t.Run("token is trimmed and level parsed", func(t *testing.T) {
		t.Setenv("DISCORD_BOT_TOKEN", "  secret-token  ")
		t.Setenv("LOG_LEVEL", "debug")

		cfg, err := Load()
		if err != nil {
			t.Fatalf("Load() error = %v", err)
		}
		if cfg.BotToken != "secret-token" {
			t.Errorf("BotToken = %q, want %q", cfg.BotToken, "secret-token")
		}
		if cfg.LogLevel != slog.LevelDebug {
			t.Errorf("LogLevel = %v, want %v", cfg.LogLevel, slog.LevelDebug)
		}
	})

	t.Run("default level when LOG_LEVEL unset", func(t *testing.T) {
		t.Setenv("DISCORD_BOT_TOKEN", "secret-token")
		t.Setenv("LOG_LEVEL", "")

		cfg, err := Load()
		if err != nil {
			t.Fatalf("Load() error = %v", err)
		}
		if cfg.LogLevel != slog.LevelInfo {
			t.Errorf("LogLevel = %v, want %v", cfg.LogLevel, slog.LevelInfo)
		}
	})
}
