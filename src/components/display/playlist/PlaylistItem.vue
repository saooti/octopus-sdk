<template>
  <div
    v-if="editRight || activePlaylist"
    class="emission-item-container shadow-element"
  >
    <router-link
      :to="{
        name: 'playlist',
        params: { playlistId: playlist.playlistId },
        query: { productor: filterOrgaId },
      }"
      :title="$t('Playlist')"
      class="d-flex flex-grow-1 text-dark"
    >
      <img
        v-lazy="proxyImageUrl(playlist.imageUrl, '260')"
        width="260"
        height="260"
        :title="$t('Playlist name image', {name:name})"
        :alt="$t('Playlist name image', {name:name})"
        class="img-box"
      >
      <div class="emission-item-text">
        <div class="d-flex align-items-center emission-name">
          <span
            v-if="!activePlaylist && !isPodcastmaker"
            :title="$t('Playlist have not podcasts')"
            class="saooti-warning text-danger me-1"
          />
          {{ name }}
        </div>
        <div
          ref="descriptionPlaylistContainer"
          class="emission-description html-wysiwyg-content"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div
            ref="descriptionPlaylist"
            v-html="urlify(description)"
          />
          <!-- eslint-enable -->
        </div>
        <router-link
          v-if="!isPodcastmaker && playlist.organisation"
          :to="{
            name: 'productor',
            params: { productorId: playlist.organisation.id },
            query: { productor: filterOrgaId },
          }"
          class="emission-producer text-primary mt-auto"
        >
          © {{ playlist.organisation.name }}
        </router-link>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { Playlist } from '@/stores/class/general/playlist';
import { state } from '../../../stores/ParamSdkStore';
import imageProxy from '../../mixins/imageProxy';
import displayMethods from '../../mixins/displayMethods';
import { useFilterStore } from '@/stores/FilterStore';
import { mapState } from 'pinia';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PlaylistItem',

  mixins: [displayMethods, imageProxy],

  props: {
    playlist: { default: ()=>({}), type: Object as ()=>Playlist},
  },
  
  computed: {
    ...mapState(useFilterStore, ['filterOrgaId']),
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    organisation(): string {
      return this.playlist?.publisher?.organisation?.name ??'';
    },
    description(): string {
      return this.playlist.description ?? '';
    },
    name(): string {
      return this.playlist.title;
    },
    organisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    editRight(): boolean {
      return (true===state.generalParameters.isPlaylist &&
        this.organisationId === this.playlist.organisation?.id) ||
        (state.generalParameters.isAdmin as boolean);
    },
    activePlaylist(): boolean {
      return 0 !== Object.keys(this.playlist.samplingViews??[]).length;
    },
  },
  mounted() {
    const playlistDesc = (this.$refs.descriptionPlaylist as HTMLElement);
    const playlistDescContainer = (this.$refs.descriptionPlaylistContainer as HTMLElement);
    if (playlistDesc?.clientHeight > playlistDescContainer?.clientHeight) {
      playlistDescContainer.classList.add('after-emission-description');
    }
  },
})
</script>