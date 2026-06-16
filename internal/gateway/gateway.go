// Package gateway wires a discordgo session that logs every received gateway
// event through a structured logger.
package gateway

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/bwmarrin/discordgo"
)

// NewSession creates a discordgo session that logs every non-privileged gateway
// event. The caller is responsible for calling Open() and Close() on the
// returned session.
func NewSession(token string, logger *slog.Logger) (*discordgo.Session, error) {
	session, err := discordgo.New("Bot " + token)
	if err != nil {
		return nil, fmt.Errorf("create discord session: %w", err)
	}

	// Request only non-privileged intents. Message content, member lists and
	// presences require privileged intents enabled in the Developer Portal.
	session.Identify.Intents = discordgo.IntentsAllWithoutPrivileged

	// Bridge discordgo's internal logs (reconnects, heartbeats, errors) into slog.
	discordgo.Logger = func(msgL, _ int, format string, a ...any) {
		logger.Log(context.Background(), discordgoLevel(msgL), "discordgo",
			slog.String("msg", fmt.Sprintf(format, a...)))
	}

	// Catch-all handler: log the concrete Go type of every dispatched event.
	session.AddHandler(func(_ *discordgo.Session, event any) {
		logger.Info("gateway event", slog.String("event_type", fmt.Sprintf("%T", event)))
	})

	// Log connection details once the gateway becomes ready.
	session.AddHandlerOnce(func(_ *discordgo.Session, ready *discordgo.Ready) {
		logger.Info("ready",
			slog.String("user", ready.User.String()),
			slog.String("session_id", ready.SessionID),
			slog.Int("guild_count", len(ready.Guilds)),
		)
	})

	return session, nil
}

// discordgoLevel maps discordgo's internal log levels onto slog levels.
func discordgoLevel(msgL int) slog.Level {
	switch msgL {
	case discordgo.LogError:
		return slog.LevelError
	case discordgo.LogWarning:
		return slog.LevelWarn
	case discordgo.LogDebug:
		return slog.LevelDebug
	default:
		return slog.LevelInfo
	}
}
