<template>
  <li
    v-if="editRight || activePlaylist"
    class="emission-item-container shadow-element"
  >
    <router-link
      :to="{
        name: 'playlist',
        params: { playlistId: playlist.playlistId },
        query: { productor: $store.state.filter.organisationId },
      }"
      :title="$t('Playlist')"
      class="d-flex flex-grow-1 text-dark"
    >
      <img
        v-lazy="playlist.imageUrl"
        :title="$t('Playlist name image', {name:name})"
        :alt="$t('Playlist name image', {name:name})"
        class="img-box"
      >
      <div class="emission-item-text">
        <div class="emission-name">
          <img
            v-if="!activePlaylist && !isPodcastmaker"
            class="icon-caution"
            src="/img/caution.png"
            :title="$t('Playlist have not podcasts')"
            :alt="$t('Playlist have not podcasts')"
          >{{ name }}
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
        <div class="flex-grow-1" />
        <router-link
          v-if="!isPodcastmaker && playlist.organisation"
          :to="{
            name: 'productor',
            params: { productorId: playlist.organisation.id },
            query: { productor: $store.state.filter.organisationId },
          }"
          class="text-dark"
        >
          <div class="emission-producer primary-darker">
            © {{ playlist.organisation.name }}
          </div>
        </router-link>
      </div>
    </router-link>
  </li>
</template>

<script lang="ts">
import { Playlist } from '@/store/class/general/playlist';
import { state } from '../../../store/paramStore';
import { displayMethods } from '../../mixins/functions';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PlaylistItem',

  mixins: [displayMethods],

  props: {
    playlist: { default: ()=>({}), type: Object as ()=>Playlist},
  },

  data() {
    return {
      dummyParam: new Date().getTime().toString() as string,
    };
  },
  
  computed: {
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
        true == state.generalParameters.isAdmin;
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