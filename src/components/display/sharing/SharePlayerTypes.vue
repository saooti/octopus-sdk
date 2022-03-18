<template>
  <div class="d-flex flex-column">
    <label
      for="iframe-select"
      title="select miniplayer"
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
import { state } from '../../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
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
    iFrameModel: { default: 'default', type: String},
    organisationId: { default: undefined, type: String},
  },
  emits:['update:iFrameModel'],

  data() {
    return {
      customPlayers: [] as Array<CustomPlayer>,
    };
  },

  computed: {
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
    },
    customPlayersDisplay(): Array<CustomPlayer>{
      return this.customPlayers.filter((player: CustomPlayer)=>{
        return (('EPISODE' === player.typePlayer ||'SUGGESTION' === player.typePlayer) && this.podcast && this.podcast.podcastId) ||
                          ('EMISSION' === player.typePlayer && this.emission  && !this.podcast)|| ('PLAYLIST' === player.typePlayer && this.playlist );
      });
    },
  },
   async created() {
    await this.initCustomPlayers();
  },

  methods: {
    async fetchCustomPlayers(type:string, trySelect: boolean): Promise<boolean>{
      let players = await octopusApi.fetchCustomPlayer('customPlayer/type/'+ this.organisationId+'/'+type);
      let playersContent = players.content;
      const totalCount = players.totalElements;
      let index = 1;
      while (totalCount > playersContent.length) {
        players =  await octopusApi.fetchCustomPlayer('customPlayer/type/'+ this.organisationId+'/'+type+'?start='+index);
        playersContent = playersContent.concat(players.content);
        ++index;
      }
      this.customPlayers = this.customPlayers.concat(playersContent);
      if(trySelect && this.customPlayers[0] && this.customPlayers[0].selected){
        this.$emit('update:iFrameModel',this.customPlayers[0].customId);
        return false;
      }
      return true;
    },
    async initCustomPlayers(): Promise<void> {
      if (!this.authenticated) return;
      if(this.playlist){
        this.fetchCustomPlayers('PLAYLIST', true);
      }else if(this.emission  && !this.podcast){
        this.fetchCustomPlayers('EMISSION', true);
      }else{
        let playerTrySelect = true;
        playerTrySelect = await this.fetchCustomPlayers('EPISODE', playerTrySelect);
        playerTrySelect = await this.fetchCustomPlayers('EMISSION', playerTrySelect);
        playerTrySelect = await this.fetchCustomPlayers('SUGGESTION', playerTrySelect);
      }
    },
  }
})
</script>