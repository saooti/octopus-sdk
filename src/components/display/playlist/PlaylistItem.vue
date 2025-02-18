<template>
  <article class="classic-element-container">
    <router-link
      :to="{
        name: 'playlist',
        params: { playlistId: playlist.playlistId },
      }"
      :title="$t('Playlist name page', { name: name })"
      class="d-flex flex-grow-1 text-dark"
    >
      <div class="classic-element-text">
        <div v-if="!activePlaylist" class="sticker-empty-ressource">
          {{ $t("Empty playlist") }}
        </div>
        <div class="d-flex align-items-center element-name basic-line-clamp">
          {{ name }}
        </div>
        <div
          ref="descriptionPlaylistContainer"
          class="element-description html-wysiwyg-content"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div ref="descriptionPlaylist" v-html="urlify(description)" />
          <!-- eslint-enable -->
        </div>
        <router-link
          v-if="!isPodcastmaker && playlist.organisation"
          :to="{
            name: 'productor',
            params: { productorId: playlist.organisation.id },
          }"
          class="text-dark mt-auto py-1"
        >
          © {{ playlist.organisation.name }}
        </router-link>
      </div>
      <img
        v-lazy="useProxyImageUrl(playlist.imageUrl, '250')"
        width="250"
        height="250"
        role="presentation"
        alt=""
        :title="$t('Playlist name image', { name: name })"
        class="img-box"
      />
    </router-link>
  </article>
</template>

<script lang="ts">
import { Playlist } from "@/stores/class/general/playlist";
import { state } from "../../../stores/ParamSdkStore";
import {useImageProxy} from "../../composable/useImageProxy";
import displayHelper from "../../../helper/displayHelper";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PlaylistItem",

  props: {
    playlist: { default: () => ({}), type: Object as () => Playlist },
  },
  setup(){
    const { useProxyImageUrl } = useImageProxy();
    return { useProxyImageUrl }
  },

  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    organisation(): string {
      return this.playlist?.publisher?.organisation?.name ?? "";
    },
    description(): string {
      return this.playlist.description ?? "";
    },
    name(): string {
      return this.playlist.title;
    },
    activePlaylist(): boolean {
      return 0 !== Object.keys(this.playlist.samplingViews ?? []).length;
    },
  },
  mounted() {
    const playlistDesc = this.$refs.descriptionPlaylist as HTMLElement;
    const playlistDescContainer = this.$refs
      .descriptionPlaylistContainer as HTMLElement;
    if (playlistDesc?.clientHeight > playlistDescContainer?.clientHeight) {
      playlistDescContainer.classList.add("after-element-description");
    }
  },
  methods:{
    urlify(text:string|undefined){
      return displayHelper.urlify(text);
    },
  }
});
</script>
<style lang="scss">
.octopus-app .sticker-empty-ressource{
  position: absolute;
  top: 5px;
  right: 5px;
  align-self: center;
  background: var(--octopus-tertiary);
  padding: 0.5rem;
  transition: all 0.5s ease;
  color: var(--octopus-color-on-primary);
  font-size: 0.6rem;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 10px 10px 34px -15px var(--octopus-shadow);
  border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
  border: solid 2px var(--octopus-color-text);
  cursor: auto;

  &:hover {
    box-shadow: 2px 8px 4px -6px var(--octopus-shadow);
    background: var(--octopus-primary);
  }
}
</style>

