<template>
  <div class="d-flex">
    <div v-if="playerError" class="text-warning mx-2">
      {{ $t("Podcast play error") + " - " }}
    </div>
    <component
      :is="linkAdvertising ? 'a' : 'div'"
      class="flex-grow-1 text-truncate text-light"
      :class="titleClass"
      :href="linkAdvertising"
      rel="noopener"
      target="_blank"
    >
      {{ podcastTitle }}
    </component>
  </div>
</template>
<script lang="ts">
import { fetchRadioData } from "../../../mixins/radio/fetchRadioData";
import { state } from "../../../../stores/ParamSdkStore";
import { usePlayerStore } from "@/stores/PlayerStore";
import { useVastStore } from "@/stores/VastStore";
import { mapState, mapActions } from "pinia";
import { defineComponent } from "vue";
import { MediaRadio } from "@/stores/class/general/player";
import { Podcast } from "@/stores/class/general/podcast";
export default defineComponent({
  name: "PlayerTitle",
  mixins: [fetchRadioData],

  props: {
    playerError: { default: false, type: Boolean },
    hlsReady: { default: false, type: Boolean },
    titleClass: { default: "", type: String },
  },

  data() {
    return {
      radioInterval: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },
  computed: {
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerRadio",
      "playerLive",
      "playerMedia",
      "emissionName",
    ]),
    ...mapState(useVastStore, [
      "isAdPlaying",
      "titleAdvertising",
      "linkAdvertising",
    ]),
    isEmissionName(): boolean {
      return state.player.emissionName as boolean;
    },
    podcastTitle(): string {
      if (this.isAdPlaying) {
        return this.$t("Advertising") + this.titleAdvertising;
      }
      if (this.playerRadio) {
        if (this.playerRadio.podcast) {
          return this.playerRadio.podcast.title;
        }
        return this.displayTitle(this.playerRadio.metadata);
      }
      if (this.playerPodcast) {
        if (this.isEmissionName)
          return this.emissionName + " - " + this.playerPodcast.title;
        return this.playerPodcast.title;
      }
      if (this.playerMedia) return this.playerMedia.title;
      if (this.playerLive) {
        if (!this.hlsReady)
          return (
            this.playerLive.title + " (" + this.$t("Start in a while") + ")"
          );
        return this.playerLive.title;
      }
      return "";
    },
  },
  watch: {
    playerRadio: {
      deep: true,
      immediate: true,
      handler(newValue, oldValue) {
        if (oldValue && newValue && newValue.canalId === oldValue.canalId) {
          return;
        }
        clearInterval(this.radioInterval as unknown as number);
        if (this.playerRadio) {
          this.fetchCurrentlyPlaying();
          this.radioInterval = setInterval(() => {
            this.fetchCurrentlyPlaying();
          }, 10000);
        }
      },
    },
  },
  methods: {
    ...mapActions(usePlayerStore, ["playerMetadata", "playerRadioPodcast", "playerRadioUpdateNextAdvertisingStartDate"]),
    async fetchCurrentlyPlaying(): Promise<void> {
      this.fetchRadioMetadata(
        this.playerRadio?.canalId ?? 0,
        this.playerRadio?.metadata.title ?? "",
        this.updateMetadata,
        this.updateAdvertising
      );
    },
    updateAdvertising(
      nextAdvertisingStartDate: string|null
    ): void {
      this.playerRadioUpdateNextAdvertisingStartDate(nextAdvertisingStartDate)
    },
    updateMetadata(
      metadata: MediaRadio,
      podcast: Podcast | undefined,
      history: Array<MediaRadio>,
    ): void {
      this.playerMetadata(metadata, history);
      this.playerRadioPodcast(podcast);
    },
  },
});
</script>
