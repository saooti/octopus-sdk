<template>
  <iframe 
    width="500"
    height="281"
    :title="$t('Video')"
    class="youtube-iframe"
    :src="'https://www.youtube.com/embed/'+youtubeId"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen>
  </iframe>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "PlayerYoutubeEmbed",
  components: {
  },
  props: {
    youtubeId: { default: undefined, type: String },
  },

});
</script>
<style lang="scss">
@use "../../../../style/videoPlayer";
</style>
