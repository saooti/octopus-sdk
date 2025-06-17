<template>
  <div v-if="podcast" class="d-flex align-items-center mt-1">
    <button
      class="btn btn-round-light ms-2"
      :title="t('Download')"
      @click="downloadPodcast"
    >
      <DownloadIcon />
    </button>
  </div>
</template>

<script setup lang="ts">
import DownloadIcon from "vue-material-design-icons/Download.vue";
import { Podcast } from "@/stores/class/general/podcast";
import downloadHelper from "../../../helper/downloadHelper";
import classicApi from "../../../api/classicApi";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  podcast: { default: undefined, type: Object as () => Podcast },
})

//Composables
const { t } = useI18n();

//Methods
async function downloadPodcast() {
  const data = await classicApi.fetchData<{
    location: string;
    downloadId: string;
  }>({
    api: 0,
    path:"podcast/download/register/"+ props.podcast?.podcastId+".mp3?origin=saooti_play_download",
  });
  downloadHelper.onDownload("/download/url?param="+encodeURIComponent(data.location), props.podcast?.title + ".mp3");
}
</script>
