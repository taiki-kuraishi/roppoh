// Command discord-gateway-proxy connects to the Discord gateway and logs every
// received event as structured JSON.
package main

import (
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/tsar-org/roppoh/internal/config"
	"github.com/tsar-org/roppoh/internal/gateway"
	"github.com/tsar-org/roppoh/internal/logging"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		// The configured logger is not available yet; use a default one.
		logging.New(slog.LevelError).Error("invalid configuration", "error", err)
		os.Exit(1)
	}

	logger := logging.New(slog.LevelInfo)

	session, err := gateway.NewSession(cfg.BotToken, logger)
	if err != nil {
		logger.Error("failed to create gateway session", "error", err)
		os.Exit(1)
	}

	if err := session.Open(); err != nil {
		logger.Error("failed to open gateway connection", "error", err)
		os.Exit(1)
	}
	defer func() { _ = session.Close() }()

	logger.Info("discord-gateway-proxy started")

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	logger.Info("shutting down")
}
