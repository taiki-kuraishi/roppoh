package handler

import (
	"time"

	"github.com/bwmarrin/discordgo"

	"github.com/tsar-org/roppoh/cmd/discord-gateway-proxy/internal/pipeline"
)

// newVoiceStateHandler returns a discordgo handler that enqueues a
// pipeline.VoiceRecord for every VOICE_STATE_UPDATE. ChannelID is empty when
// the update represents a member leaving voice entirely.
func newVoiceStateHandler(enq Enqueuer[pipeline.VoiceRecord]) func(*discordgo.Session, *discordgo.VoiceStateUpdate) {
	return func(_ *discordgo.Session, v *discordgo.VoiceStateUpdate) {
		enq.Enqueue(pipeline.VoiceRecord{
			ReceivedAt: time.Now(),
			GuildID:    v.GuildID,
			UserID:     v.UserID,
			ChannelID:  v.ChannelID,
			SessionID:  v.SessionID,
			SelfMute:   v.SelfMute,
			SelfDeaf:   v.SelfDeaf,
			Mute:       v.Mute,
			Deaf:       v.Deaf,
		})
	}
}
