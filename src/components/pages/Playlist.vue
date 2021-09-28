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
import PodcastList from '../display/playlist/PodcastList.vue';
const octopusApi = require('@saooti/octopus-api');
import { state } from '../../store/paramStore';
import { displayMethods } from '../mixins/functions';
import { Playlist } from '@/store/class/playlist';
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    ShareButtons: () => import('../display/sharing/ShareButtons.vue'),
    EditBox: () => import('@/components/display/edit/EditBox.vue'),
    PodcastList,
    SharePlayer: () => import('../display/sharing/SharePlayer.vue'),
  },
  mixins:[displayMethods],
  props: {
    playlistId: { default: undefined as number|undefined},
    isEducation: { default: false as boolean},
  },
  emits: ['playlistTitle'],

  data() {
    return {
      loaded: false as boolean,
      playlist: undefined as Playlist | undefined,
      error: false as boolean,
      isReady: true as boolean,
    };
  },

  mounted() {
    this.getPlaylistDetails();
  },
  
  computed: {
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    isEditBox(): boolean {
      return state.podcastPage.EditBox;
    },
    isShareButtons(): boolean {
      return state.podcastPage.ShareButtons;
    },
    isSharePlayer(): boolean {
      return state.podcastPage.SharePlayer;
    },
    name(): string {
      return this.playlist ? this.playlist.title : '';
    },
    imageUrl(): string {
      const dummy = new Date().getTime().toString();
      return this.playlist ? this.playlist.imageUrl + '?dummy=' + dummy : '';
    },
    description(): string {
      return this.playlist ? this.playlist.description : '';
    },
    editRight(): boolean {
      if (
        (state.generalParameters.isPlaylist &&
          this.organisationId === this.playlist!.organisation.id) ||
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
    async getPlaylistDetails(): Promise<void> {
      try {
        const data = await octopusApi.fetchPlaylist(this.playlistId);
        this.playlist = data;
        this.$emit('playlistTitle', this.playlist!.title);
        this.loaded = true;
      } catch {
        this.error = true;
        this.loaded = true;
      }
    },
  },
})
</script>
