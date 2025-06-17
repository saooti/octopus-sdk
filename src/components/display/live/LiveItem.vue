<template>
  <PodcastItem
    v-if="live && 0 !== live.podcastId"
    :podcast="live"
    :fetch-conference="fetchConference"
  />
</template>

<script setup lang="ts">
import classicApi from "../../../api/classicApi";
import PodcastItem from "../podcasts/PodcastItem.vue";
import { Podcast } from "@/stores/class/general/podcast";
import {onBeforeMount, onUnmounted, ref, Ref } from "vue";
import {
  Conference,
  ConferencePublicInfo,
} from "@/stores/class/conference/conference";

//Props 
const props = defineProps({
  fetchConference: { default: undefined, type: Object as () => Conference },
})
 
//Emits
const emit = defineEmits(["deleteItem", "updateItem"]);

//Data 
const live: Ref<Podcast | undefined> = ref(undefined);
const watchInterval: Ref<ReturnType<typeof setInterval> | undefined> = ref(undefined);


onBeforeMount(()=>initLiveItem());
onUnmounted(()=>clearWatchStatus())


//Methods
function clearWatchStatus() {
  clearInterval(watchInterval.value as unknown as number);
  watchInterval.value = undefined;
}
async function initLiveItem(){
  await fetchPodcastData();
  watchInterval.value = setInterval(() => {
    fetchStatus();
  }, 5000);
}
async function fetchPodcastData(): Promise<void> {
  if (!props.fetchConference?.podcastId) return;
  try {
    live.value = await classicApi.fetchData<Podcast>({
      api: 0,
      path: "podcast/" + props.fetchConference.podcastId,
    });
  } catch {
    emit("deleteItem");
    if (props.fetchConference.conferenceId) {
      await classicApi.deleteData({
        api: 9,
        path: "conference/" + props.fetchConference.conferenceId,
      });
    }
  }
}
async function fetchStatus(): Promise<void> {
  if (
    !props.fetchConference ||
    ("PLANNED" !== props.fetchConference.status &&
      "PENDING" !== props.fetchConference.status &&
      "RECORDING" !== props.fetchConference.status)
  ) {
    clearWatchStatus();
    return;
  }
  const confInfo = await classicApi.fetchData<ConferencePublicInfo>({
    api: 9,
    path: "conference/info/" + props.fetchConference.conferenceId,
  });
  const newStatus = confInfo.status;
  if (newStatus !== props.fetchConference.status) {
    emit("updateItem", {
      ...props.fetchConference,
      ...{ status: newStatus },
    });
  }
}
</script>
