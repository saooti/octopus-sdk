<template>
  <div>
    <div
      v-if="loaded && !error"
      class="page-box"
    >
      <h1>{{ $t('Playlist') }}</h1>
      <div class="d-flex">
        <div class="d-flex flex-column flex-grow">
          <EditBox
            v-if="editRight && isEditBox"
            :playlist="playlist"
            :is-ready="isReady"
          />
          <div class="module-box">
            <h2>{{ name }}</h2>
            <div class="mb-5 mt-3 descriptionText">
              <img
                :src="imageUrl"
                :alt="$t('Playlist name image', { name: name })"
                class="img-box shadow-element float-start me-3 mb-3"
              >
              <!-- eslint-disable vue/no-v-html -->
              <p
                class="html-wysiwyg-content"
                v-html="urlify(description)"
              />
              <!-- eslint-enable -->
            </div>
          </div>
        </div>
        <div class="d-flex flex-column share-container">
          <SharePlayer
            v-if="isSharePlayer && authenticated"
            :playlist="playlist"
            :organisation-id="organisationId"
            :is-education="isEducation"
          />
          <ShareButtons v-if="isShareButtons" />
        </div>
      </div>
      <PodcastList :playlist="playlist" />
    </div>
    <div
      v-if="!loaded"
      class="d-flex justify-content-center"
    >
      <div class="spinner-border me-3" />
      <h3 class="mt-2">
        {{ $t('Loading content ...') }}
      </h3>
    </div>
    <div
      v-if="error"
      class="text-center"
    >
      <h3>{{ $t("Playlist doesn't exist") }}</h3>
    </div>
  </div>
</template>

<script lang="ts">
import PodcastList from '../display/playlist/PodcastList.vue';
import octopusApi from '@saooti/octopus-api';
import { state } from '../../store/paramStore';
import { displayMethods } from '../mixins/functions';
import { Playlist } from '@/store/class/general/playlist';
import { defineComponent, defineAsyncComponent } from 'vue';
const ShareButtons = defineAsyncComponent(() => import('../display/sharing/ShareButtons.vue'));
const EditBox = defineAsyncComponent(() => import('@/components/display/edit/EditBox.vue'));
const SharePlayer = defineAsyncComponent(() => import('../display/sharing/SharePlayer.vue'));
export default defineComponent({
  components: {
    ShareButtons,
    EditBox,
    PodcastList,
    SharePlayer,
  },
  mixins:[displayMethods],
  props: {
    playlistId: { default: undefined, type: Number},
    isEducation: { default: false, type: Boolean},
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
  
  computed: {
    organisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
    },
    isEditBox(): boolean {
      return (state.podcastPage.EditBox as boolean);
    },
    isShareButtons(): boolean {
      return (state.podcastPage.ShareButtons as boolean);
    },
    isSharePlayer(): boolean {
      return (state.podcastPage.SharePlayer as boolean);
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
        (state.generalParameters.isPlaylist && this.playlist &&
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

  mounted() {
    this.getPlaylistDetails();
  },
  methods: {
    async getPlaylistDetails(): Promise<void> {
      try {
        const data: Playlist = await octopusApi.fetchPlaylist(this.playlistId ? this.playlistId.toString(): "");
        this.playlist = data;
        this.$emit('playlistTitle', this.playlist.title);
        this.loaded = true;
      } catch {
        this.error = true;
        this.loaded = true;
      }
    },
  },
})
</script>

<style lang="scss"></style>