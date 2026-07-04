package handler

import (
	"time"

	"github.com/bwmarrin/discordgo"

	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"
)

// newPresenceHandler returns a discordgo handler that enqueues a
// pipeline.PresenceRecord for every activity in every PRESENCE_UPDATE.
func newPresenceHandler(enq Enqueuer[pipeline.PresenceRecord]) func(*discordgo.Session, *discordgo.PresenceUpdate) {
	return func(_ *discordgo.Session, p *discordgo.PresenceUpdate) {
		for _, record := range presenceRecords(p.GuildID, &p.Presence) {
			enq.Enqueue(record)
		}
	}
}

// presenceRecords expands a single discordgo.Presence into one
// pipeline.PresenceRecord per activity, since Cloudflare Pipelines SQL has
// no UNNEST to flatten the activities array at query time. A presence with
// zero activities still produces exactly one record, with the Activity*
// fields left nil (SQL NULL).
//
// It is shared by the live PresenceUpdate handler above and the GuildCreate
// startup-snapshot handler (guild.go), which report the same shape into
// different tables.
func presenceRecords(guildID string, presence *discordgo.Presence) []pipeline.PresenceRecord {
	var userID string
	if presence.User != nil {
		userID = presence.User.ID
	}

	base := pipeline.PresenceRecord{
		ReceivedAt:    time.Now(),
		GuildID:       guildID,
		UserID:        userID,
		Status:        string(presence.Status),
		ClientDesktop: string(presence.ClientStatus.Desktop),
		ClientMobile:  string(presence.ClientStatus.Mobile),
		ClientWeb:     string(presence.ClientStatus.Web),
	}

	if len(presence.Activities) == 0 {
		return []pipeline.PresenceRecord{base}
	}

	records := make([]pipeline.PresenceRecord, 0, len(presence.Activities))
	for _, a := range presence.Activities {
		record := base
		name, activityType, state, details := a.Name, int(a.Type), a.State, a.Details
		record.ActivityName = &name
		record.ActivityType = &activityType
		record.ActivityState = &state
		record.ActivityDetails = &details
		records = append(records, record)
	}

	return records
}
