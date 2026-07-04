package handler

import (
	"log/slog"

	"github.com/bwmarrin/discordgo"
)

// newGuildCreateHandler returns a discordgo handler that enqueues a
// PRESENCE_UPDATE-shaped pipeline.Event for every member presence snapshot
// included in a GUILD_CREATE. Discord sends this snapshot once per guild
// whenever the gateway session starts or resumes; it is the only way to know
// who was already online before the bot connected, so without it activity
// history would only ever start from the first live PresenceUpdate.
func newGuildCreateHandler(enq Enqueuer, logger *slog.Logger) func(*discordgo.Session, *discordgo.GuildCreate) {
	return func(_ *discordgo.Session, g *discordgo.GuildCreate) {
		logger.Info("seeding presence snapshot from guild create",
			slog.String("guild_id", g.ID),
			slog.Int("presence_count", len(g.Presences)),
		)

		for _, presence := range g.Presences {
			enq.Enqueue(presenceEvent(g.ID, presence))
		}
	}
}
