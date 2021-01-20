<template>
  <li class="mt-3 emission-item-container shadow-element" v-if="editRight || activePlaylist">
    <router-link 
    :to="{ name: 'playlist', params: {playlistId:playlist.playlistId}, query:{productor: $store.state.filter.organisationId}}"
    :aria-label="$t('Playlist')"
    class="text-dark">
      <div class="img-box" :style="{ 'background-image': 'url(\'' + playlist.imageUrl +'?dummy='+dummyParam+ '\')' }"></div>
    </router-link>
    <div class="emission-item-text">
      <router-link 
      :to="{ name: 'playlist', params: {playlistId:playlist.playlistId}, query:{productor: $store.state.filter.organisationId}}"
      class="text-dark">
        <div class="emission-name">
        <img class="icon-caution" src="/img/caution.png" v-if="!activePlaylist && !isPodcastmaker" :title="$t('Playlist have not podcasts')"/>{{ name }}</div>
        <div class="emission-description" v-html="description">{{ description }}</div>
      </router-link>
      <div class="flex-grow"></div>
      <router-link 
      :to="{ name: 'productor', params: {productorId:playlist.organisation.id}, query:{productor: $store.state.filter.organisationId}}"
      class="text-dark" v-if="!isPodcastmaker && playlist.organisation">
        <div class="emission-producer primary-color">© {{ playlist.organisation.name }}</div>
      </router-link>
    </div>
  </li>
</template>

<style lang="scss">
</style>

<script>
import {state} from "../../../store/paramStore.js";
/* import octopusApi from "@saooti/octopus-api"; */
export default {
  name: 'PlaylistItem',

  props: ['playlist'],

  data() {
    return {
      dummyParam : new Date().getTime().toString(),
    };
  },

  computed: {
    isPodcastmaker(){
      return state.generalParameters.podcastmaker;
    },

    organisation() {
      return '' + this.playlist.publisher.organisation.name;
    },

    description() {
      let description;
      description = this.playlist.description || '';
      if (state.generalParameters.isIE11)
        return description.substring(0, 50) + '...';
      return description;
    },

    name() {
      if (state.generalParameters.isIE11)
        return this.playlist.title.substring(0, 50) + '...';
      return this.playlist.title;
    },

    organisationId(){
      return state.generalParameters.organisationId;
    },

    editRight() {
      if ((state.generalParameters.isPlaylist && this.organisationId === this.playlist.organisation.id )|| state.generalParameters.isAdmin)
        return true;
      return false;
    },
    activePlaylist(){
      return Object.keys(this.playlist.podcasts).length !== 0;
    }
  },

   methods:{
  },
};
</script>
