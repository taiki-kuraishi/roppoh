// Command discord-gateway-proxy connects to the Discord gateway and logs every
// received event as structured JSON through the OpenTelemetry logging pipeline.
package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/config"
	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/gateway"
	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/handler"
	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"
	"github.com/tsar-org/roppoh/internal/telemetry"
)

func main() {
	if err := run(context.Background()); err != nil {
		os.Exit(1)
	}
}

// run wires up logging, configuration and the gateway session. It is split out
// from main so that deferred cleanup (notably flushing the log processor) runs
// before the process exits; os.Exit would skip those defers.
func run(ctx context.Context) error {
	logger, shutdownTelemetry, err := telemetry.Setup(ctx)
	if err != nil {
		// The OTel logger is unavailable; report the failure on stderr.
		slog.New(slog.NewJSONHandler(os.Stderr, nil)).Error("failed to set up telemetry", "error", err)
		return err
	}
	defer func() {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := shutdownTelemetry(shutdownCtx); err != nil {
			slog.New(slog.NewJSONHandler(os.Stderr, nil)).Error("failed to shut down telemetry", "error", err)
		}
	}()

	// Load runtime configuration from the environment.
	cfg, err := config.Load()
	if err != nil {
		logger.Error("invalid configuration", "error", err)
		return err
	}

	// Buffer and batch activity/presence records to their respective
	// Cloudflare Pipelines streams. This defer runs before shutdownTelemetry
	// (registered above) and after session.Close (registered below), so
	// buffered records are flushed while the logging pipeline is still up.
	presenceClient := pipeline.New[pipeline.PresenceRecord]("presence_update", cfg.PresenceUpdateEndpoint, cfg.PipelineAPIToken, logger)
	snapshotClient := pipeline.New[pipeline.PresenceRecord]("guild_presence_snapshot", cfg.GuildPresenceSnapshotEndpoint, cfg.PipelineAPIToken, logger)
	voiceClient := pipeline.New[pipeline.VoiceRecord]("voice_state_update", cfg.VoiceStateUpdateEndpoint, cfg.PipelineAPIToken, logger)
	pipelineClients := []pipeline.Shutdowner{presenceClient, snapshotClient, voiceClient}
	defer func() {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		for _, c := range pipelineClients {
			if err := c.Shutdown(shutdownCtx); err != nil {
				logger.Error("failed to shut down pipeline client", "error", err)
			}
		}
	}()

	// Build the Discord gateway session from the bot token, wired up to also
	// report activity/presence records to the pipeline clients.
	handlers := handler.Handlers(handler.Enqueuers{
		Presence: presenceClient,
		Snapshot: snapshotClient,
		Voice:    voiceClient,
	}, logger)
	session, err := gateway.NewSession(cfg.BotToken, logger, handlers...)
	if err != nil {
		logger.Error("failed to create gateway session", "error", err)
		return err
	}

	// Open the connection to the Discord gateway.
	if err := session.Open(); err != nil {
		logger.Error("failed to open gateway connection", "error", err)
		return err
	}
	defer func() { _ = session.Close() }()

	// Startup completed successfully; announce readiness.
	logger.Info("discord-gateway-proxy started")

	// Block until an interrupt or termination signal arrives.
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	// A signal was received; deferred cleanup (session, telemetry) runs next.
	logger.Info("shutting down")

	return nil
}
