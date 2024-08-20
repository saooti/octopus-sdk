<template>
  <AdsProgressBar v-if="isAdPlaying" :class="classProgress" />
  <RadioProgressBar v-else-if="radioUrl" :class="classProgress" />
  <PodcastProgressBar
    v-else
    :show-comments="showComments"
    :display-alert-bar="displayAlertBar"
    :percent-live-progress="percentLiveProgress"
    :duration-live-position="durationLivePosition"
    :player-error="playerError"
    :listen-time="listenTime"
    :class-progress="classProgress"
  />
</template>
<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";
import { usePlayerStore } from "@/stores/PlayerStore";
import { useVastStore } from "@/stores/VastStore";
import { mapState } from "pinia";
const RadioProgressBar = defineAsyncComponent(
  () => import("../radio/RadioProgressBar.vue"),
);
const AdsProgressBar = defineAsyncComponent(
  () => import("../ads/AdsProgressBar.vue"),
);
const PodcastProgressBar = defineAsyncComponent(
  () => import("./PodcastProgressBar.vue"),
);
export default defineComponent({
  name: "PlayerProgressBar",

  components: {
    PodcastProgressBar,
    RadioProgressBar,
    AdsProgressBar,
  },

  props: {
    classProgress: { default: "", type: String },
    playerError: { default: false, type: Boolean },
    showComments: { default: false, type: Boolean },
    displayAlertBar: { default: false, type: Boolean },
    percentLiveProgress: { default: 0, type: Number },
    durationLivePosition: { default: 0, type: Number },
    listenTime: { default: 0, type: Number },
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(useVastStore, ["isAdPlaying"]),
    ...mapState(usePlayerStore, ["radioUrl"]),
  },
});
</script>
