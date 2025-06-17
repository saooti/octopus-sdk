<template>
  <PodcastInlineListTemplate
    v-if="loading || (!loading && 0 !== allPodcasts.length)"
    :display-arrow="false"
    :button-text="t('See more')"
    :button-plus="true"
    :title="playlist?.title ?? ''"
    :href="'/main/pub/playlist/' + playlistId"
    :podcast-id="playlistId"
  >
    <template #list-inline>
      <ClassicLoading
        class="loading-size"
        :loading-text="loading ? t('Loading podcasts ...') : undefined"
      />
      <SwiperList
        v-if="!loading"
        :list-object="allPodcasts"
        :size-item-overload="sizeItemOverload"
      >
        <template #octopusSlide="{ option }">
          <PodcastItem
            class="flex-shrink-0 item-phone-margin"
            :podcast="option"
          />
        </template>
      </SwiperList>
    </template>
  </PodcastInlineListTemplate>
</template>

<script setup lang="ts">
import classicApi from "../../../api/classicApi";
import PodcastInlineListTemplate from "../podcasts/PodcastInlineListTemplate.vue";
import PodcastItem from "../podcasts/PodcastItem.vue";
import SwiperList from "../list/SwiperList.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { useAuthStore } from "../../../stores/AuthStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Playlist } from "@/stores/class/general/playlist";
import { onMounted, Ref, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  playlistId: { default: undefined, type: Number },
  sizeItemOverload: { default: undefined, type: Number }
})

//Data 
const loading = ref(true);
const totalCount = ref(0);
const playlist: Ref<Playlist | undefined> = ref(undefined);
const allPodcasts: Ref<Array<Podcast>> = ref([]);

//Composables
const { t } = useI18n();
const authStore = useAuthStore();

//Watch
watch(()=>props.playlistId, () => {
  reset();
  fetchContent();
});

onMounted(()=>fetchContent())

//Methods
async function fetchContent(): Promise<void> {
  allPodcasts.value.length = 0;
  loading.value = true;
  playlist.value = await classicApi.fetchData<Playlist>({
    api: 0,
    path: "playlist/" + props.playlistId,
  });
  allPodcasts.value = await classicApi.fetchData<Array<Podcast>>({
    api: 0,
    path: "playlist/" + props.playlistId + "/content",
  });
  if (
    !(
      (undefined !== authStore.authOrgaId &&
      authStore.authOrgaId === playlist.value?.organisation?.id) ||
      authStore.isRoleAdmin
    )
  ) {
    allPodcasts.value = allPodcasts.value.filter((p: Podcast | null) => {
      return (
        null !== p &&
        (!p.availability || true === p.availability.visibility)
      );
    });
  }
  loading.value = false;
}
function reset(): void {
  totalCount.value = 0;
  allPodcasts.value.length = 0;
}
</script>
