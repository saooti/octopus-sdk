<template>
  <li class="emission-player-container shadow-element" v-if="activeEmission ||editRight">
    <router-link 
    :to="{ name: 'emission', params: {emissionId:emission.emissionId}, query:{productor: $store.state.filter.organisationId}}"
    class="d-flex flex-column text-dark">
      <div class="emissionPlayerItem-info" v-if="rubriqueName">{{rubriqueName}}</div>
      <div class="img-box no-border-round" :style="{ 'background-image': 'url(\'' + emission.imageUrl +'?dummy='+dummyParam+ '\')' }"></div>
      <div class="d-flex flex-column p-2">
          <div class="font-weight-bold text-uppercase text-ellipsis">{{emission.name}}</div>
          <div class="text-ellipsis" v-html="emission.description">{{emission.description}}</div>
      </div>
    </router-link>
    <div class="border-top emission-item-border-color p-2 secondary-bg d-flex" v-for="p in podcasts" :key="p.podcastId">
        <div class="d-flex justify-content-between flex-grow">
            <router-link 
            :to="{ name: 'podcast', params: {podcastId:p.podcastId}, query:{productor: $store.state.filter.organisationId}}"
            class="d-flex flex-column define-width text-dark">
            <div class="font-weight-bold text-ellipsis">{{p.title}}</div>
            <div class="two-line-clamp" v-html="p.description">{{p.description}}</div>
            </router-link>
            <div class="play-button-box bg-secondary" @click="play(p)" v-if="$store.state.player.podcast !== p ||($store.state.player.podcast === p && $store.state.player.status === 'PAUSED')">
                <div class="text-light saooti-play2-bounty" :aria-label="$t('Play')"></div>
            </div>
            <div class="play-button-box bg-secondary" @click="pause(p)" v-else>
                <div class="text-light saooti-pause-bounty" :aria-label="$t('Pause')"></div>
            </div>
        </div>
    </div>
    <div class="border-top emission-item-border-color p-2 secondary-bg d-flex justify-content-center" v-if="buttonMore && podcasts.length === nbPodcasts">
      <router-link 
      :to="{ name: 'emission', params: {emissionId:emission.emissionId}, query:{productor: $store.state.filter.organisationId}}"
      class="btn">{{$t('More episodes')}}</router-link>
    </div>
  </li>
</template>

<style lang="scss">
.no-border-round{
    border-radius: 0;
}
.text-ellipsis{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.emission-player-container {
  list-style: none;
  background: #fff;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 13rem;
  height: min-content;
  border-radius: 0.8rem;
  overflow: hidden;
  .define-width{
    width: 9rem;
  }
  @media (max-width: 960px){
    .d-flex:not(.flex-column){
      flex-wrap: nowrap;
    }
  }
}
.two-line-clamp{
  display: block;
  max-width: 100%;
  height: 29px;
  font-size: 14px;
  line-height: 1;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.emission-item-border-color{
  border-color: #ddd;
}
</style>

<script>
import octopusApi from "@saooti/octopus-api";
import {state} from "../../../store/paramStore.js";
export default {
  name: 'EmissionPlayerItem',

  props: ['emission', "nbPodcasts", "rubriqueName"],

  created(){
    this.loadPodcasts();
  },

  data() {
    return {
      activeEmission: true,
      podcasts : [],
      dummyParam : new Date().getTime().toString(),
    };
  },

  computed: {
    buttonMore(){
      return state.emissionsPage.buttonMore;
    },
    editRight() {
      if ((this.authenticated && this.organisationId === this.emission.orga.id) ||state.generalParameters.isAdmin)
        return true;
      return false;
    }
  },

   methods:{
    async loadPodcasts(){
      let nb = this.nbPodcasts? this.nbPodcasts: 2;
      const data = await octopusApi.fetchPodcasts({
        emissionId: this.emission.emissionId,
        size: nb
      });
      if(data.count === 0){
        this.activeEmission = false;
      }
      this.podcasts=data.result;
      if(this.editRight || this.activeEmission){
        return;
      }
      this.$emit("emissionNotVisible");
    },
    play(podcast){
      if(podcast === this.$store.state.player.podcast){
        this.$store.commit('playerPause', false);
      } else{
        this.$store.commit('playerPlayPodcast', podcast);
      }
    },
    pause(){
      this.$store.commit('playerPause', true);
    },
  },
};
</script>
