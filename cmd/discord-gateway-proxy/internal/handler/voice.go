package handler

import (
	"time"

	"github.com/bwmarrin/discordgo"

	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"
)

// VoicePayload is the normalized shape sent to Pipelines for a
// VOICE_STATE_UPDATE event: whether a member is in a voice channel and, if
// so, which one and in what mute/deafen state.
type VoicePayload struct {
	ChannelID string `json:"channel_id"`
	SessionID string `json:"session_id"`
	SelfMute  bool   `json:"self_mute"`
	SelfDeaf  bool   `json:"self_deaf"`
	Mute      bool   `json:"mute"`
	Deaf      bool   `json:"deaf"`
}

// newVoiceStateHandler returns a discordgo handler that enqueues a
// pipeline.Event for every VOICE_STATE_UPDATE. ChannelID is empty when the
// update represents a member leaving voice entirely.
func newVoiceStateHandler(enq Enqueuer) func(*discordgo.Session, *discordgo.VoiceStateUpdate) {
	return func(_ *discordgo.Session, v *discordgo.VoiceStateUpdate) {
		enq.Enqueue(pipeline.Event{
			EventType:  "VOICE_STATE_UPDATE",
			ReceivedAt: time.Now(),
			GuildID:    v.GuildID,
			UserID:     v.UserID,
			Payload: VoicePayload{
				ChannelID: v.ChannelID,
				SessionID: v.SessionID,
				SelfMute:  v.SelfMute,
				SelfDeaf:  v.SelfDeaf,
				Mute:      v.Mute,
				Deaf:      v.Deaf,
			},
		})
	}
}
