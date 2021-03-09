<template>
  <div>
    <div class="page-box" v-if="loaded && !error">
      <h1>{{ $t('Playlist') }}</h1>
      <div class="d-flex">
        <div class="d-flex flex-column flex-grow">
          <EditBox
            :playlist="playlist"
            :isReady="isReady"
            v-if="editRight && isEditBox"
          ></EditBox>
          <div class="module-box">
            <h2>{{ name }}</h2>
            <div class="mb-5 mt-3 descriptionText">
              <img
                :src="imageUrl"
                :alt="$t('Playlist name image', { name: name })"
                class="img-box shadow-element float-left mr-3 mb-3"
              />
              <p class="html-wysiwyg-content" v-html="urlify(description)"></p>
            </div>
          </div>
        </div>
        <div class="d-flex flex-column share-container">
          <SharePlayer
            :playlist="playlist"
            :organisationId="organisationId"
            :isEducation="isEducation"
            v-if="isSharePlayer && authenticated"
          >
          </SharePlayer>
          <ShareButtons v-if="isShareButtons"></ShareButtons>
        </div>
      </div>
      <PodcastList :playlist="playlist" />
    </div>
    <div class="d-flex justify-content-center" v-if="!loaded">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading content ...') }}</h3>
    </div>
    <div class="text-center" v-if="error">
      <h3>{{ $t("Playlist doesn't exist") }}</h3>
    </div>
  </div>
</template>
<style lang="scss"></style>
<script lang="ts">
// @ is an alias to /src
import EditBox from '@/components/display/edit/EditBox.vue';
import ShareButtons from '../display/sharing/ShareButtons.vue';
import SharePlayer from '../display/sharing/SharePlayer.vue';
import PodcastList from '../display/playlist/PodcastList.vue';
const octopusApi = require('@saooti/octopus-api');
import { state } from '../../store/paramStore.js';
import { displayMethods } from '../mixins/functions';

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    ShareButtons,
    EditBox,
    PodcastList,
    SharePlayer,
  },
  mixins: [displayMethods],

  mounted() {
    this.getPlaylistDetails();
  },

  props: ['playlistId', 'isEducation'],

  data() {
    return {
      loaded: false,
      playlist: undefined as any,
      error: false,
      isReady: true,
    };
  },

  computed: {
    organisationId() {
      return state.generalParameters.organisationId;
    },
    authenticated() {
      return state.generalParameters.authenticated;
    },
    isEditBox() {
      return state.podcastPage.EditBox;
    },
    isShareButtons() {
      return state.podcastPage.ShareButtons;
    },
    isSharePlayer() {
      return state.podcastPage.SharePlayer;
    },
    name():string {
      return this.playlist ? this.playlist.title : '';
    },

    imageUrl():string {
      let dummy = new Date().getTime().toString();
      return this.playlist ? this.playlist.imageUrl + '?dummy=' + dummy : '';
    },

    description():string {
      return this.playlist ? this.playlist.description : '';
    },

    editRight() {
      if (
        (state.generalParameters.isPlaylist &&
          this.organisationId === this.playlist.organisation.id) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
  },

  watch: {
    playlistId() {
      this.loaded = false;
      this.error = false;
      this.getPlaylistDetails();
    },
  },

  methods: {
    async getPlaylistDetails() {
      try {
        const data = await octopusApi.fetchPlaylist(this.playlistId);
        this.playlist = data;
        this.$emit('playlistTitle', this.playlist.title);
        this.loaded = true;
      } catch {
        this.error = true;
        this.loaded = true;
      }
    },
  },
});
</script>
