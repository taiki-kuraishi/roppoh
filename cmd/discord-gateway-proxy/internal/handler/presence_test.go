package handler

import (
	"testing"

	"github.com/bwmarrin/discordgo"
)

func TestPresenceHandler(t *testing.T) {
	enq := &fakeEnqueuer{}
	handle := newPresenceHandler(enq)

	handle(nil, &discordgo.PresenceUpdate{
		Presence: discordgo.Presence{
			User:   &discordgo.User{ID: "user-1"},
			Status: discordgo.StatusOnline,
			Activities: []*discordgo.Activity{
				{Name: "Apex Legends", Type: discordgo.ActivityTypeGame, State: "In Match"},
			},
			ClientStatus: discordgo.ClientStatus{Desktop: discordgo.StatusOnline},
		},
		GuildID: "guild-1",
	})

	if len(enq.events) != 1 {
		t.Fatalf("got %d events, want 1", len(enq.events))
	}

	event := enq.events[0]
	if event.EventType != "PRESENCE_UPDATE" {
		t.Errorf("EventType = %q, want PRESENCE_UPDATE", event.EventType)
	}
	if event.GuildID != "guild-1" {
		t.Errorf("GuildID = %q, want guild-1", event.GuildID)
	}
	if event.UserID != "user-1" {
		t.Errorf("UserID = %q, want user-1", event.UserID)
	}

	payload, ok := event.Payload.(PresencePayload)
	if !ok {
		t.Fatalf("Payload type = %T, want PresencePayload", event.Payload)
	}
	if payload.Status != "online" {
		t.Errorf("Status = %q, want online", payload.Status)
	}
	if payload.ClientStatus.Desktop != "online" {
		t.Errorf("ClientStatus.Desktop = %q, want online", payload.ClientStatus.Desktop)
	}
	if len(payload.Activities) != 1 || payload.Activities[0].Name != "Apex Legends" {
		t.Errorf("Activities = %+v, want one activity named Apex Legends", payload.Activities)
	}
}

func TestPresenceHandler_NoUser(t *testing.T) {
	enq := &fakeEnqueuer{}
	handle := newPresenceHandler(enq)

	handle(nil, &discordgo.PresenceUpdate{
		Presence: discordgo.Presence{Status: discordgo.StatusOffline},
		GuildID:  "guild-1",
	})

	if len(enq.events) != 1 {
		t.Fatalf("got %d events, want 1", len(enq.events))
	}
	if got := enq.events[0].UserID; got != "" {
		t.Errorf("UserID = %q, want empty when Presence.User is nil", got)
	}
}
