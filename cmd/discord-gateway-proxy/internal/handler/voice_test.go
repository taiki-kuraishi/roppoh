package handler

import (
	"testing"

	"github.com/bwmarrin/discordgo"
)

func TestVoiceStateHandler(t *testing.T) {
	enq := &fakeEnqueuer{}
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

	if len(enq.events) != 1 {
		t.Fatalf("got %d events, want 1", len(enq.events))
	}

	event := enq.events[0]
	if event.EventType != "VOICE_STATE_UPDATE" {
		t.Errorf("EventType = %q, want VOICE_STATE_UPDATE", event.EventType)
	}
	if event.GuildID != "guild-1" {
		t.Errorf("GuildID = %q, want guild-1", event.GuildID)
	}
	if event.UserID != "user-1" {
		t.Errorf("UserID = %q, want user-1", event.UserID)
	}

	payload, ok := event.Payload.(VoicePayload)
	if !ok {
		t.Fatalf("Payload type = %T, want VoicePayload", event.Payload)
	}
	if payload.ChannelID != "channel-1" {
		t.Errorf("ChannelID = %q, want channel-1", payload.ChannelID)
	}
	if !payload.SelfMute {
		t.Error("SelfMute = false, want true")
	}
}
