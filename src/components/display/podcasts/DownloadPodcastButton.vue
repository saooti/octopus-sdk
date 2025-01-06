<template>
  <div v-if="podcast" class="d-flex align-items-center mt-1">
    <button
      class="btn btn-round-light ms-2"
      :title="$t('Download')"
      @click="downloadPodcast"
    >
      <DownloadIcon />
    </button>
  </div>
</template>

<script lang="ts">
import DownloadIcon from "vue-material-design-icons/Download.vue";
import { Podcast } from "@/stores/class/general/podcast";
import download from "../../mixins/download";
import { defineComponent } from "vue";
export default defineComponent({
  name: "DownloadPodcastButton",
  components: {
    DownloadIcon,
  },

  mixins: [download],

  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
  },
  computed: {
    videoId(): string | undefined {
      return this.podcast?.video?.videoId;
    },
  },

  methods: {
    downloadPodcast() {
      this.onDownload(
        "/download/podcast/" + this.podcast?.podcastId,
        this.podcast?.title + ".mp3",
        false,
      );
    },
  },
});
</script>
