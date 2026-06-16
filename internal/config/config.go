// Package config loads runtime configuration for discord-gateway-proxy from the
// process environment.
package config

import (
	"errors"
	"log/slog"
	"os"
	"strings"
)

// Config holds the runtime configuration resolved from environment variables.
type Config struct {
	// BotToken is the Discord bot token used to authenticate the gateway connection.
	BotToken string
	// LogLevel is the minimum slog level emitted by the service.
	LogLevel slog.Level
}

// ErrMissingBotToken is returned by Load when DISCORD_BOT_TOKEN is unset or empty.
var ErrMissingBotToken = errors.New("DISCORD_BOT_TOKEN is required")

// Load reads configuration from the process environment. DISCORD_BOT_TOKEN is
// required; LOG_LEVEL is optional and defaults to "info".
func Load() (Config, error) {
	token := strings.TrimSpace(os.Getenv("DISCORD_BOT_TOKEN"))
	if token == "" {
		return Config{}, ErrMissingBotToken
	}

	return Config{
		BotToken: token,
		LogLevel: parseLogLevel(os.Getenv("LOG_LEVEL")),
	}, nil
}

// parseLogLevel maps a LOG_LEVEL string to an slog.Level, defaulting to Info for
// empty or unrecognized values.
func parseLogLevel(raw string) slog.Level {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "debug":
		return slog.LevelDebug
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
