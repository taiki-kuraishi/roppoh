// Package logging builds the structured JSON logger used across
// discord-gateway-proxy.
package logging

import (
	"log/slog"
	"os"
)

// New returns an slog.Logger that writes JSON to stdout at the given minimum
// level.
func New(level slog.Level) *slog.Logger {
	return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level}))
}
