package handler

import (
	"log/slog"

	"github.com/bwmarrin/discordgo"

	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"
)

// newGuildCreateHandler returns a discordgo handler that enqueues a
// pipeline.PresenceRecord (via presenceRecords, shared with presence.go) for
// every member presence snapshot included in a GUILD_CREATE, into the
// guild_presence_snapshot table (kept separate from live presence_update
// records even though the shape is identical).
//
// Discord sends this snapshot once per guild whenever the gateway session
// starts or resumes; it is the only way to know who was already online
// before the bot connected, so without it activity history would only ever
// start from the first live PresenceUpdate.
func newGuildCreateHandler(enq Enqueuer[pipeline.PresenceRecord], logger *slog.Logger) func(*discordgo.Session, *discordgo.GuildCreate) {
	return func(_ *discordgo.Session, g *discordgo.GuildCreate) {
		logger.Info("seeding presence snapshot from guild create",
			slog.String("guild_id", g.ID),
			slog.Int("presence_count", len(g.Presences)),
		)

		for _, presence := range g.Presences {
			for _, record := range presenceRecords(g.ID, presence) {
				enq.Enqueue(record)
			}
		}
	}
}
