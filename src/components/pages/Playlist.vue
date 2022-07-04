<template>
  <div class="page-box">
    <div
      v-if="loaded && !error"
    >
      <h1>{{ $t('Playlist') }}</h1>
      <div class="d-flex">
        <div class="d-flex flex-column flex-grow-1">
          <EditBox
            v-if="editRight && pageParameters.isEditBox"
            :playlist="playlist"
          />
          <div class="module-box">
            <h2>{{ name }}</h2>
            <div class="mb-5 mt-3 descriptionText">
              <img
                v-lazy="imageUrl"
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
        <div class="d-flex flex-column flex-grow-mobile">
          <SharePlayer
            v-if="pageParameters.isSharePlayer && authenticated"
            :playlist="playlist"
            :organisation-id="myOrganisationId"
            :is-education="isEducation"
          />
          <ShareButtons v-if="pageParameters.isShareButtons" />
        </div>
      </div>
      <PodcastList :playlist="playlist" />
    </div>
    <ClassicLoading
      :loading-text="!loaded?$t('Loading content ...'):undefined"
      :error-text="error?$t(`Playlist doesn't exist`):undefined"
    />
  </div>
</template>

<script lang="ts">
import { orgaComputed } from '../mixins/orgaComputed';
import ClassicLoading from '../form/ClassicLoading.vue';
import PodcastList from '../display/playlist/PodcastList.vue';
import octopusApi from '@saooti/octopus-api';
import { state } from '../../store/paramStore';
import { displayMethods } from '../mixins/functions';
import { handle403 } from '../mixins/handle403';
import { Playlist } from '@/store/class/general/playlist';
import { defineComponent, defineAsyncComponent } from 'vue';
import { AxiosError } from 'axios';
const ShareButtons = defineAsyncComponent(() => import('../display/sharing/ShareButtons.vue'));
const EditBox = defineAsyncComponent(() => import('@/components/display/edit/EditBox.vue'));
const SharePlayer = defineAsyncComponent(() => import('../display/sharing/SharePlayer.vue'));
export default defineComponent({
  components: {
    ShareButtons,
    EditBox,
    PodcastList,
    SharePlayer,
    ClassicLoading
  },
  mixins:[displayMethods, handle403, orgaComputed],

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
    };
  },
  computed: {
    pageParameters(){
      return {
        isEditBox : (state.podcastPage.EditBox as boolean),
        isShareButtons: (state.podcastPage.ShareButtons as boolean),
        isSharePlayer: (state.podcastPage.SharePlayer as boolean),
      };
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
          this.myOrganisationId === this.playlist.organisation?.id) ||
        state.generalParameters.isAdmin
      ){
        return true;
      }
      return false;
    },
  },
  watch: {
    playlistId: {
      immediate: true,
      handler() {
        this.getPlaylistDetails();
      },
    },
  },

  methods: {
    initError():void{
      this.error = true;
      this.loaded = true;
    },
    async getPlaylistDetails(): Promise<void> {
      try {
        this.loaded = false;
        this.error = false;
        const data: Playlist = await octopusApi.fetchData<Playlist>(0, 'playlist/'+this.playlistId);
        this.playlist = data;
        if("PUBLIC"!==this.playlist.organisation?.privacy && this.filterOrga!==this.playlist.organisation?.id){
          this.initError();
          return;
        }
        this.$emit('playlistTitle', this.playlist.title);
      } catch(error) {
        this.handle403((error as AxiosError));
        this.initError();
      }
      this.loaded = true;
    },
  },
})
</script>