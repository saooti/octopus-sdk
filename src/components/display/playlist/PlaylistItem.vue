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
      :aria-label="$t('Playlist')"
      class="text-dark"
    >
      <div
        class="img-box"
        :style="{
          'background-image':
            'url(\'' + playlist.imageUrl + '?dummy=' + dummyParam + '\')',
        }"
      />
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
            v-if="!activePlaylist && !isPodcastmaker"
            class="icon-caution"
            src="/img/caution.png"
            :title="$t('Playlist have not podcasts')"
          >{{ name }}
        </div>
        <div
          :id="'description-playlist-container-' + playlist.playlistId"
          class="emission-description html-wysiwyg-content"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div
            :id="'description-playlist-' + playlist.playlistId"
            v-html="urlify(description)"
          />
          <!-- eslint-enable -->
        </div>
      </router-link>
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
        <div class="emission-producer primary-color">
          © {{ playlist.organisation.name }}
        </div>
      </router-link>
    </div>
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
      if(this.playlist && this.playlist.publisher && this.playlist.publisher.organisation){
        return '' + this.playlist.publisher.organisation.name;
      }
      return '';
    },
    description(): string {
      return this.playlist.description || '';
    },
    name(): string {
      return this.playlist.title;
    },
    organisationId(): string|undefined {
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


  mounted() {
    const playlistDesc = document.getElementById(
      'description-playlist-' + this.playlist.playlistId
    );
    const playlistDescContainer = document.getElementById(
      'description-playlist-container-' + this.playlist.playlistId
    );
    if (
      null !== playlistDesc && null !== playlistDescContainer &&
      playlistDesc.clientHeight > playlistDescContainer.clientHeight
    ) {
      playlistDescContainer.classList.add('after-emission-description');
    }
  },
  methods: {},
})
</script>

<style lang="scss"></style>