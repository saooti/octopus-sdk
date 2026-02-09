<template>
  <div :class="responsive ? 'video-responsive-wrapper' : ''">
    <iframe
      v-if="videoId"
      ref="iframeVideo"
      :src="srcVideo"
      :title="t('Video')"
      width="500"
      height="281"
      style="z-index: 1"
      ebkitallowfullscreen="true"
      mozallowfullscreen="true"
      allowfullscreen="true"
      allow="fullscreen; autoplay"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
    <SnackBar ref="snackbar" position="bottom-left" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import SnackBar from "../../SnackBar.vue";
import { computed, onMounted, useTemplateRef } from "vue";

import { usePlayerLogicProgress } from "../../../composable/player/usePlayerLogicProgress";
import { videoApi } from "../../../../api/videoApi";

//Props 
const props = defineProps({
  videoId: { type: String, required: true },
  podcastId: { type: Number, required: false, default: null },
  responsive: { default: false, type: Boolean },
})

//Data
const snackBarRef = useTemplateRef('snackbar');

//Composables
const { t } = useI18n();
const { onTimeUpdateProgress, setDownloadId } = usePlayerLogicProgress();

//Computed
const srcVideo = computed(() => {
  return (
    "//www.ultimedia.com/deliver/generic/iframe/mdtk/01009833/zone/1/showtitle/1/src/" +
    props.videoId +
    "/sound/yes/autoplay/1"
  );
});

onMounted(async()=>{
  if (undefined === props.videoId) {
    (snackBarRef?.value as InstanceType<typeof SnackBar>).open(t("Podcast play error"));
  }

  // #14118 cf https://support.digiteka.com/fr/API/Iframe#h-3-r%C3%A9ception-des-%C3%A9v%C3%A9nements-du-player
  window.addEventListener('message', event => {
    if (typeof event.data !== 'string') {
      return;
    }

    const data = Object.fromEntries(event.data.split('&').map(d => d.split('=')));
    if (data.event === 'timeupdate') {
      onTimeUpdateProgress(parseFloat(data.time));
    }
  });

  if (props.podcastId !== undefined) {
    const downloadId = await videoApi.watchPodcast(props.podcastId);
    setDownloadId(downloadId);
  }
})
</script>

<style scoped lang="scss">
@use "../../../../style/videoPlayer";
</style>
