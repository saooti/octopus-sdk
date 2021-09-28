<template>
  <li
    class="mt-3 emission-item-container shadow-element"
    v-if="editRight || activePlaylist"
  >
    <router-link
      :to="{
        name: 'playlist',
        params: { playlistId: playlist.playlistId },
        query: { productor: $store.state.filter.organisationId },
      }"
      :aria-label="$t('Playlist')"
      class="text-dark"
    >
      <div
        class="img-box"
        :style="{
          'background-image':
            'url(\'' + playlist.imageUrl + '?dummy=' + dummyParam + '\')',
        }"
      ></div>
    </router-link>
    <div class="emission-item-text">
      <router-link
        :to="{
          name: 'playlist',
          params: { playlistId: playlist.playlistId },
          query: { productor: $store.state.filter.organisationId },
        }"
        class="text-dark"
      >
        <div class="emission-name">
          <img
            class="icon-caution"
            src="/img/caution.png"
            v-if="!activePlaylist && !isPodcastmaker"
            :title="$t('Playlist have not podcasts')"
          />{{ name }}
        </div>
        <div
          :id="'description-playlist-container-' + playlist.playlistId"
          class="emission-description html-wysiwyg-content"
        >
          <div
            :id="'description-playlist-' + playlist.playlistId"
            v-html="urlify(description)"
          ></div>
        </div>
      </router-link>
      <div class="flex-grow"></div>
      <router-link
        :to="{
          name: 'productor',
          params: { productorId: playlist.organisation.id },
          query: { productor: $store.state.filter.organisationId },
        }"
        class="text-dark"
        v-if="!isPodcastmaker && playlist.organisation"
      >
        <div class="emission-producer primary-color">
          © {{ playlist.organisation.name }}
        </div>
      </router-link>
    </div>
  </li>
</template>

<style lang="scss"></style>

<script lang="ts">
import { Playlist } from '@/store/class/playlist';
import { state } from '../../../store/paramStore';
import { displayMethods } from '../../mixins/functions';
export default {
  name: 'PlaylistItem',

  mixins: [displayMethods],

  props: {
    playlist: { default: undefined as Playlist|undefined},
  },

  data() {
    return {
      dummyParam: new Date().getTime().toString() as string,
    };
  },


  mounted() {
    const playlistDesc = document.getElementById(
      'description-playlist-' + this.playlist.playlistId
    );
    const playlistDescContainer = document.getElementById(
      'description-playlist-container-' + this.playlist.playlistId
    );
    if (
      null !== playlistDesc &&
      playlistDesc.clientHeight > playlistDescContainer!.clientHeight
    ) {
      playlistDescContainer!.classList.add('after-emission-description');
    }
  },
  
  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    organisation(): string {
      return '' + this.playlist.publisher!.organisation!.name;
    },
    description(): string {
      return this.playlist.description || '';
    },
    name(): string {
      return this.playlist.title;
    },
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
    editRight(): boolean {
      if (
        (state.generalParameters.isPlaylist &&
          this.organisationId === this.playlist.organisation.id) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    activePlaylist(): boolean {
      return 0 !== Object.keys(this.playlist.podcasts).length;
    },
  },
  methods: {},
};
</script>
