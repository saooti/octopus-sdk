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
import downloadHelper from "../../../helper/downloadHelper";
import { defineComponent } from "vue";
import classicApi from "@/api/classicApi";
export default defineComponent({
  name: "DownloadPodcastButton",
  components: {
    DownloadIcon,
  },

  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
  },
  computed: {
    videoId(): string | undefined {
      return this.podcast?.video?.videoId;
    },
  },

  methods: {
    async downloadPodcast() {
      const data = await classicApi.fetchData<{
        location: string;
        downloadId: string;
      }>({
        api: 0,
        path:"podcast/download/register/"+ this.podcast?.podcastId+".mp3?origin=saooti_play_download",
      });
      downloadHelper.onDownload("/download/url?param="+encodeURIComponent(data.location), this.podcast?.title + ".mp3");
    },
  },
});
</script>
