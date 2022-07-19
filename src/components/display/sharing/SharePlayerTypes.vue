<template>
  <div class="d-flex flex-column">
    <label
      for="iframe-select"
      title="select miniplayer"
    />
    <select
      id="iframe-select"
      :value="iFrameModel"
      class=""
      @change="$emit('update:iFrameModel',$event.target.value)"
    >
      <template
        v-for="option in optionsSelect"
        :key="option.value"
      >
        <option
          v-if="option.condition"
          :value="option.value"
        >
          {{ option.name }}
        </option>
      </template>
      <option
        v-for="player in customPlayersDisplay"
        :key="player.customId"
        :value="player.customId"
      >
        {{ $t('Custom version') + " «" +player.name+"»" }}
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
import { InterfacePageable } from '@/store/class/general/interfacePageable';
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
    optionsSelect(){
      return [
        {name: this.$t('Default version'), value: 'default', condition: true},
        {name: this.$t('Large version'), value: 'large', condition: true},
        {name: this.$t('Emission version'), value: 'emission', condition: this.podcast && this.podcast.podcastId},
        {name: this.$t('Large emission version'), value: 'emissionLarge', condition: this.podcast && this.podcast.podcastId},
        {name: this.$t('Large suggestion version'), value: 'largeSuggestion', condition: this.podcast && this.podcast.podcastId}
      ]
    },
    customPlayersDisplay(): Array<CustomPlayer>{
      return this.customPlayers.filter((player: CustomPlayer)=>{
        return (('EPISODE' === player.typePlayer ||'SUGGESTION' === player.typePlayer) &&this.podcast?.podcastId) ||
                          ('EMISSION' === player.typePlayer && this.emission  && !this.podcast)|| ('PLAYLIST' === player.typePlayer && this.playlist );
      });
    },
  },
  async created() {
    await this.initCustomPlayers();
  },
  methods: {
    async fetchCustomPlayers(type:string, trySelect: boolean): Promise<boolean>{
      let players = await octopusApi.fetchDataPublic<InterfacePageable<CustomPlayer>>(6,'customPlayer/type/'+ this.organisationId+'/'+type);
      let playersContent = players.content;
      const totalCount = players.totalElements;
      let index = 1;
      while (totalCount > playersContent.length) {
        players =  await octopusApi.fetchDataPublic<InterfacePageable<CustomPlayer>>(6,'customPlayer/type/'+ this.organisationId+'/'+type+'?start='+index);
        playersContent = playersContent.concat(players.content);
        ++index;
      }
      this.customPlayers = this.customPlayers.concat(playersContent);
      if(trySelect && this.customPlayers[0] && this.customPlayers[0].selected){
        this.$emit('update:iFrameModel',this.customPlayers[0].customId.toString());
        return false;
      }
      return true;
    },
    async initCustomPlayers(): Promise<void> {
      if (!state.generalParameters.authenticated) return;
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