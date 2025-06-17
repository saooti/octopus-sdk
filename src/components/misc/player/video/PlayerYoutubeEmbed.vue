<template>
  <iframe 
    width="500"
    height="281"
    :title="t('Video')"
    class="youtube-iframe"
    :src="'https://www.youtube.com/embed/'+youtubeId"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen>
  </iframe>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

//Props 
defineProps({
  youtubeId: { default: undefined, type: String },
})

//Composables
const { t } = useI18n();
</script>
<style lang="scss">
@use "../../../../style/videoPlayer";
</style>
