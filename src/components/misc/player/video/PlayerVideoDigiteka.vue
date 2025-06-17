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

//Props 
const props = defineProps({
  videoId: { default: undefined, type: String },
  responsive: { default: false, type: Boolean },
})

//Data
const snackBarRef = useTemplateRef('snackbar');

//Composables
const { t } = useI18n();


//Computed
const srcVideo = computed(() => {
  return (
    "//www.ultimedia.com/deliver/generic/iframe/mdtk/01009833/zone/1/showtitle/1/src/" +
    props.videoId +
    "/sound/yes/autoplay/1"
  );
});

onMounted(()=>{
  if (undefined === props.videoId) {
    (snackBarRef?.value as InstanceType<typeof SnackBar>).open(t("Podcast play error"));
  }
})

</script>
<style lang="scss">
@use "../../../../style/videoPlayer";
</style>
