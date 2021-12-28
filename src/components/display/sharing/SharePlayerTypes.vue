<template>
  <div class="d-flex flex-column">
    <label
      for="iframe-select"
      aria-label="select miniplayer"
    />
    <select
      id="iframe-select"
      :value="iFrameModel"
      class="input-no-outline"
      @change="$emit('update:iFrameModel',$event.target.value)"
    >
      <option value="default">
        {{ $t('Default version') }}
      </option>
      <option value="large">
        {{ $t('Large version') }}
      </option>
      <option
        v-for="player in customPlayersDisplay"
        :key="player.customId"
        :value="player.customId"
      >
        {{ $t('Custom version') + " «" +player.name+"»" }}
      </option>
      <option
        v-if="podcast && podcast.podcastId"
        value="emission"
      >
        {{
          $t('Emission version')
        }}
      </option>
      <option
        v-if="podcast && podcast.podcastId"
        value="emissionLarge"
      >
        {{ $t('Large emission version') }}
      </option>
      <option
        v-if="podcast && podcast.podcastId"
        value="largeSuggestion"
      >
        {{ $t('Large suggestion version') }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { Podcast } from '@/store/class/general/podcast';
import { CustomPlayer } from '@/store/class/general/customPlayer';
import { defineComponent } from 'vue';
import { Emission } from '@/store/class/general/emission';
import { Playlist } from '@/store/class/general/playlist';
export default defineComponent({
  props: {
    podcast: { default: undefined, type: Object as ()=> Podcast},
    emission: { default: undefined, type: Object as ()=> Emission},
    playlist: { default: undefined, type: Object as ()=> Playlist},
    customPlayers: { default: ()=>[], type: Array as ()=> Array<CustomPlayer>},
    iFrameModel: { default: 'default', type: String},
  },
  emits:['update:iFrameModel'],

  computed: {
    customPlayersDisplay(): Array<CustomPlayer>{
      return this.customPlayers.filter((player: CustomPlayer)=>{
        return (('EPISODE' === player.typePlayer ||'SUGGESTION' === player.typePlayer) && this.podcast && this.podcast.podcastId) ||
                          ('EMISSION' === player.typePlayer && this.emission  && !this.podcast)|| ('PLAYLIST' === player.typePlayer && this.playlist );
      });
    },
  },
})
</script>