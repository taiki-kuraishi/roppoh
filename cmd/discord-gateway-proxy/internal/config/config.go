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
}

// ErrMissingBotToken is returned by Load when DISCORD_BOT_TOKEN is unset or empty.
var ErrMissingBotToken = errors.New("DISCORD_BOT_TOKEN is required")

// Load reads configuration from the process environment. DISCORD_BOT_TOKEN is required.
func Load() (Config, error) {
	token := strings.TrimSpace(os.Getenv("DISCORD_BOT_TOKEN"))
	if token == "" {
		return Config{}, ErrMissingBotToken
	}

	return Config{BotToken: token}, nil
}
