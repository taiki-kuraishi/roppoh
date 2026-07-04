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
	// PipelineEndpoint is the Cloudflare Pipelines HTTP ingest endpoint that
	// collected gateway events are sent to.
	PipelineEndpoint string
	// PipelineAPIToken authenticates requests to PipelineEndpoint (requires the
	// Workers Pipeline Send permission).
	PipelineAPIToken string
}

// ErrMissingBotToken is returned by Load when DISCORD_BOT_TOKEN is unset or empty.
var ErrMissingBotToken = errors.New("DISCORD_BOT_TOKEN is required")

// ErrMissingPipelineEndpoint is returned by Load when PIPELINE_INGEST_ENDPOINT is
// unset or empty.
var ErrMissingPipelineEndpoint = errors.New("PIPELINE_INGEST_ENDPOINT is required")

// ErrMissingPipelineAPIToken is returned by Load when PIPELINE_API_TOKEN is unset
// or empty.
var ErrMissingPipelineAPIToken = errors.New("PIPELINE_API_TOKEN is required")

// Load reads configuration from the process environment. Every field is required.
func Load() (Config, error) {
	botToken, err := requireEnv("DISCORD_BOT_TOKEN", ErrMissingBotToken)
	if err != nil {
		return Config{}, err
	}

	pipelineEndpoint, err := requireEnv("PIPELINE_INGEST_ENDPOINT", ErrMissingPipelineEndpoint)
	if err != nil {
		return Config{}, err
	}

	pipelineAPIToken, err := requireEnv("PIPELINE_API_TOKEN", ErrMissingPipelineAPIToken)
	if err != nil {
		return Config{}, err
	}

	return Config{
		BotToken:         botToken,
		PipelineEndpoint: pipelineEndpoint,
		PipelineAPIToken: pipelineAPIToken,
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
