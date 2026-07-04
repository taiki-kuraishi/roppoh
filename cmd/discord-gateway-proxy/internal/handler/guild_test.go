package handler

import (
	"io"
	"log/slog"
	"testing"

	"github.com/bwmarrin/discordgo"
)

func TestGuildCreateHandler_SeedsPresenceSnapshot(t *testing.T) {
	enq := &fakeEnqueuer{}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	handle := newGuildCreateHandler(enq, logger)

	handle(nil, &discordgo.GuildCreate{
		Guild: &discordgo.Guild{
			ID: "guild-1",
			Presences: []*discordgo.Presence{
				{User: &discordgo.User{ID: "user-1"}, Status: discordgo.StatusOnline},
				{User: &discordgo.User{ID: "user-2"}, Status: discordgo.StatusIdle},
			},
		},
	})

	if len(enq.events) != 2 {
		t.Fatalf("got %d events, want 2", len(enq.events))
	}

	for i, wantUserID := range []string{"user-1", "user-2"} {
		event := enq.events[i]
		if event.EventType != "PRESENCE_UPDATE" {
			t.Errorf("event[%d].EventType = %q, want PRESENCE_UPDATE", i, event.EventType)
		}
		if event.GuildID != "guild-1" {
			t.Errorf("event[%d].GuildID = %q, want guild-1", i, event.GuildID)
		}
		if event.UserID != wantUserID {
			t.Errorf("event[%d].UserID = %q, want %q", i, event.UserID, wantUserID)
		}
	}
}

func TestGuildCreateHandler_NoPresences(t *testing.T) {
	enq := &fakeEnqueuer{}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	handle := newGuildCreateHandler(enq, logger)

	handle(nil, &discordgo.GuildCreate{Guild: &discordgo.Guild{ID: "guild-1"}})

	if len(enq.events) != 0 {
		t.Fatalf("got %d events, want 0", len(enq.events))
	}
}
