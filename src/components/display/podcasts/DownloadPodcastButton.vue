<template>
    <div v-if="podcast" class="d-flex align-items-center mt-1">
        <button
            type="button"
            class="btn btn-round-light ms-2"
            :title="t('Download')"
            @click="downloadPodcast"
        >
            <DownloadIcon aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
import DownloadIcon from "vue-material-design-icons/Download.vue";
import { Podcast } from "@/stores/class/general/podcast";
import downloadHelper from "../../../helper/downloadHelper";
import { useI18n } from "vue-i18n";
import { podcastApi } from "@/api";
import { useNotificationStore } from "@/stores/NotificationStore";

//Props
const props = defineProps({
    podcast: { default: undefined, type: Object as () => Podcast },
})

//Composables
const { t } = useI18n();
const notificationStore = useNotificationStore();

//Methods
async function downloadPodcast() {
    try {
        const data = await podcastApi.downloadRegister(props.podcast?.podcastId, {
            origin: 'saooti_play_download'
        });
        // Direct download first, through the backend proxy only for hosts without CORS
        await downloadHelper.onDownload(data.location, props.podcast?.title + ".mp3", false, true);
    } catch {
        // downloadRegister already shows its own message for some errors (e.g. country blocked)
        if (!notificationStore.currentNotification) {
            notificationStore.addNotification({
                type: 'error',
                title: t('Error'),
                message: t('Download - Error')
            });
        }
    }
}
</script>
