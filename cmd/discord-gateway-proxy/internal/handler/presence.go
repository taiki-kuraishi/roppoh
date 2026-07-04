package handler

import (
	"time"

	"github.com/bwmarrin/discordgo"

	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"
)

// PresencePayload is the normalized shape sent to Pipelines for a
// PRESENCE_UPDATE event: only the fields activity/online-offline monitoring
// needs, decoupled from discordgo's own (much larger) Presence struct so the
// wire schema stays stable across discordgo upgrades.
type PresencePayload struct {
	Status       string              `json:"status"`
	ClientStatus ClientStatusPayload `json:"client_status"`
	Activities   []ActivityPayload   `json:"activities"`
}

// ClientStatusPayload reports which client surfaces (if any) a user is
// online from.
type ClientStatusPayload struct {
	Desktop string `json:"desktop,omitempty"`
	Mobile  string `json:"mobile,omitempty"`
	Web     string `json:"web,omitempty"`
}

// ActivityPayload is a normalized discordgo.Activity: the game/stream/custom
// status name plus the two free-text fields Discord rich presence exposes.
type ActivityPayload struct {
	Name    string `json:"name"`
	Type    int    `json:"type"`
	State   string `json:"state,omitempty"`
	Details string `json:"details,omitempty"`
}

// newPresenceHandler returns a discordgo handler that enqueues a
// pipeline.Event for every PRESENCE_UPDATE.
func newPresenceHandler(enq Enqueuer) func(*discordgo.Session, *discordgo.PresenceUpdate) {
	return func(_ *discordgo.Session, p *discordgo.PresenceUpdate) {
		enq.Enqueue(presenceEvent(p.GuildID, &p.Presence))
	}
}

// presenceEvent builds the pipeline.Event envelope for a single presence
// snapshot. It is shared by the live PresenceUpdate handler and the
// GuildCreate startup-snapshot handler, which both report the same shape.
func presenceEvent(guildID string, presence *discordgo.Presence) pipeline.Event {
	var userID string
	if presence.User != nil {
		userID = presence.User.ID
	}

	activities := make([]ActivityPayload, 0, len(presence.Activities))
	for _, a := range presence.Activities {
		activities = append(activities, ActivityPayload{
			Name:    a.Name,
			Type:    int(a.Type),
			State:   a.State,
			Details: a.Details,
		})
	}

	return pipeline.Event{
		EventType:  "PRESENCE_UPDATE",
		ReceivedAt: time.Now(),
		GuildID:    guildID,
		UserID:     userID,
		Payload: PresencePayload{
			Status: string(presence.Status),
			ClientStatus: ClientStatusPayload{
				Desktop: string(presence.ClientStatus.Desktop),
				Mobile:  string(presence.ClientStatus.Mobile),
				Web:     string(presence.ClientStatus.Web),
			},
			Activities: activities,
		},
	}
}
