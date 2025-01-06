<template>
  <div
    class="img-box img-box-podcast position-relative flex-shrink-0 mb-3 me-3 float-start"
  >
    <img
      v-lazy="
        radio.imageUrl
          ? proxyImageUrl(radio.imageUrl, '270')
          : '/img/emptyradio.webp'
      "
      width="270"
      height="270"
      role="presentation"
      alt=""
      class="img-box img-box-podcast"
      :title="$t('Canal name image', { name: radio.name })"
    />
    <button class="radio-play-button" @click="playRadio">
      <PlayIcon v-if="!playingRadio" :title="$t('Play')" :size="40" />
      <PodcastIsPlaying v-else/>
      <div class="ms-2">
        {{ playText }}
      </div>
    </button>
  </div>
</template>

<script lang="ts">
import PlayIcon from "vue-material-design-icons/Play.vue";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { useFilterStore } from "../../../stores/FilterStore";
import { mapState, mapActions } from "pinia";
import imageProxy from "../../mixins/imageProxy";
import { defineAsyncComponent, defineComponent } from "vue";
import { Canal } from "@/stores/class/radio/canal";
const PodcastIsPlaying = defineAsyncComponent(() => import("../podcasts/PodcastIsPlaying.vue"));
export default defineComponent({
  name: "RadioImage",

  components: {
    PlayIcon,
    PodcastIsPlaying
  },

  mixins: [imageProxy],

  props: {
    radio: { default: undefined, type: Object as () => Canal },
  },

  computed: {
    ...mapState(usePlayerStore, ["playerRadio", "playerStatus"]),
    ...mapState(useFilterStore, ["filterOrgaId"]),
    playingRadio() {
      return this.playerRadio && this.playerRadio.canalId === this.radio?.id;
    },
    playText(): string {
      return this.playingRadio && "PLAYING" === this.playerStatus
        ? this.$t("Pause")
        : this.$t("Play");
    },
  },

  methods: {
    ...mapActions(usePlayerStore, ["playerPlay", "playerChangeStatus"]),
    playRadio(): void {
      if (!this.radio) {
        return;
      }
      if (this.playingRadio) {
        this.playerChangeStatus("PLAYING" === this.playerStatus);
      } else {
        this.playerPlay({
          canalId: this.radio.id,
          url: "https://" + this.radio.url + "/live.m3u8",
          metadata: "",
        });
      }
    },
  },
});
</script>
<style lang="scss">
@use '@scss/variables' as octopusVariables;
.octopus-app {
  .radio-play-button{
    display: flex;
    align-items: center;
    position: absolute;
    bottom: 0;
    font-size: 1rem;
    color: white;
    background-color: octopusVariables.$primaryColorLessTransparent;
    border-radius: octopusVariables.$octopus-borderradius;
    padding:  0.2rem;
    border: 0;
  }
}
</style>