<template>
  <div class="d-flex align-items-center">
    <div
      v-if="currentlyPlayingString.length || podcastRadio"
      class="me-2 fw-bold"
    >
      {{ $t("Currently") + " : " }}
    </div>
    <router-link
      v-if="podcastRadio"
      class="d-flex align-items-center"
      :to="{
        name: 'podcast',
        params: { podcastId: podcastRadio.podcastId },
      }"
      :title="$t('Episode name page', { name: podcastRadio.title })"
    >
      <img
        v-lazy="useProxyImageUrl(podcastRadio.imageUrl, '80')"
        width="80"
        height="80"
        class="small-img-box"
        role="presentation"
        alt=""
        :title="$t('Episode name image', { name: podcastRadio.title })"
      />
      <div>{{ podcastRadio.title }}</div>
    </router-link>
    <div v-else-if="currentlyPlayingString.length">
      {{ currentlyPlayingString }}
    </div>
  </div>
</template>

<script lang="ts">
import {useFetchRadio} from "../../composable/radio/usefetchRadioData";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { mapState } from "pinia";
import {useImageProxy} from "../../composable/useImageProxy";
import { defineComponent } from "vue";
import { Canal } from "@/stores/class/radio/canal";
import { MediaRadio } from "@/stores/class/general/player";
import { Podcast } from "@/stores/class/general/podcast";
export default defineComponent({
  name: "RadioItem",

  components: {},

  props: {
    radio: { default: undefined, type: Object as () => Canal },
  },
  setup(){
    const { fetchRadioMetadata, displayTitle } = useFetchRadio();
    const { useProxyImageUrl } = useImageProxy();
    return { fetchRadioMetadata, displayTitle, useProxyImageUrl };
  },


  data() {
    return {
      currentMetadata: undefined as undefined | MediaRadio,
      currentPodcast: undefined as undefined | Podcast,
      radioInterval: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },

  computed: {
    ...mapState(usePlayerStore, ["playerRadio"]),
    playingRadio() {
      return this.playerRadio && this.playerRadio.canalId === this.radio?.id;
    },
    podcastRadio(): Podcast | undefined {
      if (this.playingRadio) {
        return this.playerRadio?.podcast;
      }
      return this.currentPodcast;
    },
    currentlyPlayingString(): string {
      if (this.playingRadio && this.playerRadio) {
        return this.displayTitle(this.playerRadio.metadata);
      }
      if (this.currentMetadata) {
        return this.displayTitle(this.currentMetadata);
      }
      return "";
    },
  },

  mounted() {
    this.fetchCurrentlyPlaying();
    this.radioInterval = setInterval(() => {
      this.fetchCurrentlyPlaying();
    }, 10000);
  },
  methods: {
    async fetchCurrentlyPlaying(): Promise<void> {
      if (!this.radio || this.playingRadio) {
        return;
      }
      this.fetchRadioMetadata(
        this.radio.id,
        this.currentMetadata?.title ?? "",
        this.updateMetadata,
      );
    },
    updateMetadata(metadata: MediaRadio, podcast?: Podcast): void {
      this.currentMetadata = metadata;
      this.currentPodcast = podcast;
    },
  },
});
</script>
<style lang="scss">
.octopus-app .small-img-box {
  height: 80px;
  width: 80px;
  border-radius: var(--octopus-border-radius);
  overflow: hidden;
  flex-shrink: 0;
  margin: 0.5rem;
}
</style>
