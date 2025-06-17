<template>
  <AdsProgressBar v-if="vastStore.isAdPlaying" :class="classProgress" />
  <RadioProgressBar v-else-if="playerStore.radioUrl" :class="classProgress" />
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
<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { usePlayerStore } from "../../../../stores/PlayerStore";
import { useVastStore } from "../../../../stores/VastStore";
const RadioProgressBar = defineAsyncComponent(
  () => import("../radio/RadioProgressBar.vue"),
);
const AdsProgressBar = defineAsyncComponent(
  () => import("../ads/AdsProgressBar.vue"),
);
const PodcastProgressBar = defineAsyncComponent(
  () => import("./PodcastProgressBar.vue"),
);

//Props 
defineProps({
  classProgress: { default: "", type: String },
  playerError: { default: false, type: Boolean },
  showComments: { default: false, type: Boolean },
  displayAlertBar: { default: false, type: Boolean },
  percentLiveProgress: { default: 0, type: Number },
  durationLivePosition: { default: 0, type: Number },
  listenTime: { default: 0, type: Number },
})

//Composables
const playerStore = usePlayerStore();
const vastStore = useVastStore();

</script>
