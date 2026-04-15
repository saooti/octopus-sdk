<template>
  <PodcastInlineListTemplate
    v-if="loading || (!loading && 0 !== allPodcasts.length)"
    :display-arrow="false"
    :button-text="noMoreButton ? undefined : t('See more')"
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
import PodcastInlineListTemplate from "../podcasts/PodcastInlineListTemplate.vue";
import PodcastItem from "../podcasts/PodcastItem.vue";
import SwiperList from "../list/SwiperList.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { useAuthStore } from "../../../stores/AuthStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Playlist } from "@/stores/class/general/playlist";
import { onMounted, Ref, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { playlistApi } from "../../../api/playlistApi";

//Props 
const props = defineProps<{
  /** ID of the playlist to display */
  playlistId: number;
  sizeItemOverload?: number;
  /** When set to true, disable display of "see more" button */
  noMoreButton?: boolean;
}>();

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

  // Retrieve both playlist & content at the same time
  const [playlistData, content] = await Promise.all([
    playlistApi.get(props.playlistId),
    playlistApi.getContentFull(props.playlistId)
  ]);

  // Update data
  playlist.value = playlistData;
  allPodcasts.value = content;

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
