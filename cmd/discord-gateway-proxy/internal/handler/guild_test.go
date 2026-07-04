package handler

import (
	"io"
	"log/slog"
	"testing"

	"github.com/bwmarrin/discordgo"

	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"
)

func TestGuildCreateHandler_SeedsPresenceSnapshot(t *testing.T) {
	enq := &fakeEnqueuer[pipeline.PresenceRecord]{}
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

	// Neither presence has an activity, so it's one record per presence.
	if len(enq.records) != 2 {
		t.Fatalf("got %d records, want 2", len(enq.records))
	}

	for i, wantUserID := range []string{"user-1", "user-2"} {
		record := enq.records[i]
		if record.GuildID != "guild-1" {
			t.Errorf("records[%d].GuildID = %q, want guild-1", i, record.GuildID)
		}
		if record.UserID != wantUserID {
			t.Errorf("records[%d].UserID = %q, want %q", i, record.UserID, wantUserID)
		}
	}
}

func TestGuildCreateHandler_NoPresences(t *testing.T) {
	enq := &fakeEnqueuer[pipeline.PresenceRecord]{}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	handle := newGuildCreateHandler(enq, logger)

	handle(nil, &discordgo.GuildCreate{Guild: &discordgo.Guild{ID: "guild-1"}})

	if len(enq.records) != 0 {
		t.Fatalf("got %d records, want 0", len(enq.records))
	}
}
