package handler

import (
	"testing"

	"github.com/bwmarrin/discordgo"

	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"
)

func TestPresenceHandler_OneActivity(t *testing.T) {
	enq := &fakeEnqueuer[pipeline.PresenceRecord]{}
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

	if len(enq.records) != 1 {
		t.Fatalf("got %d records, want 1", len(enq.records))
	}

	record := enq.records[0]
	if record.GuildID != "guild-1" {
		t.Errorf("GuildID = %q, want guild-1", record.GuildID)
	}
	if record.UserID != "user-1" {
		t.Errorf("UserID = %q, want user-1", record.UserID)
	}
	if record.Status != "online" {
		t.Errorf("Status = %q, want online", record.Status)
	}
	if record.ClientDesktop != "online" {
		t.Errorf("ClientDesktop = %q, want online", record.ClientDesktop)
	}
	if record.ActivityName == nil || *record.ActivityName != "Apex Legends" {
		t.Errorf("ActivityName = %v, want Apex Legends", record.ActivityName)
	}
	if record.ActivityType == nil || *record.ActivityType != int(discordgo.ActivityTypeGame) {
		t.Errorf("ActivityType = %v, want %d", record.ActivityType, discordgo.ActivityTypeGame)
	}
}

func TestPresenceHandler_MultipleActivities(t *testing.T) {
	enq := &fakeEnqueuer[pipeline.PresenceRecord]{}
	handle := newPresenceHandler(enq)

	handle(nil, &discordgo.PresenceUpdate{
		Presence: discordgo.Presence{
			User:   &discordgo.User{ID: "user-1"},
			Status: discordgo.StatusOnline,
			Activities: []*discordgo.Activity{
				{Name: "Apex Legends", Type: discordgo.ActivityTypeGame},
				{Name: "ばいちゃ", Type: discordgo.ActivityTypeCustom},
			},
		},
		GuildID: "guild-1",
	})

	if len(enq.records) != 2 {
		t.Fatalf("got %d records, want 2 (one per activity)", len(enq.records))
	}
	for i, wantName := range []string{"Apex Legends", "ばいちゃ"} {
		if got := enq.records[i].ActivityName; got == nil || *got != wantName {
			t.Errorf("records[%d].ActivityName = %v, want %q", i, got, wantName)
		}
		// Every record from the same presence shares the non-activity fields.
		if enq.records[i].UserID != "user-1" {
			t.Errorf("records[%d].UserID = %q, want user-1", i, enq.records[i].UserID)
		}
	}
}

func TestPresenceHandler_NoActivity(t *testing.T) {
	enq := &fakeEnqueuer[pipeline.PresenceRecord]{}
	handle := newPresenceHandler(enq)

	handle(nil, &discordgo.PresenceUpdate{
		Presence: discordgo.Presence{Status: discordgo.StatusOffline},
		GuildID:  "guild-1",
	})

	if len(enq.records) != 1 {
		t.Fatalf("got %d records, want 1", len(enq.records))
	}

	record := enq.records[0]
	if got := record.UserID; got != "" {
		t.Errorf("UserID = %q, want empty when Presence.User is nil", got)
	}
	if record.ActivityName != nil || record.ActivityType != nil || record.ActivityState != nil || record.ActivityDetails != nil {
		t.Errorf("Activity* = %+v, want all nil (SQL NULL) when there are no activities", record)
	}
}
