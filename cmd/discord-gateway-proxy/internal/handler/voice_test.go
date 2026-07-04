package handler

import (
	"testing"

	"github.com/bwmarrin/discordgo"

	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"
)

func TestVoiceStateHandler(t *testing.T) {
	enq := &fakeEnqueuer[pipeline.VoiceRecord]{}
	handle := newVoiceStateHandler(enq)

	handle(nil, &discordgo.VoiceStateUpdate{
		VoiceState: &discordgo.VoiceState{
			GuildID:   "guild-1",
			ChannelID: "channel-1",
			UserID:    "user-1",
			SessionID: "session-1",
			SelfMute:  true,
		},
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
	if record.ChannelID != "channel-1" {
		t.Errorf("ChannelID = %q, want channel-1", record.ChannelID)
	}
	if !record.SelfMute {
		t.Error("SelfMute = false, want true")
	}
}
