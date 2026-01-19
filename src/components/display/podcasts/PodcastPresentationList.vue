<!--
  Simple component to display a few podcasts
-->
<template>
  <PresentationLayout
    v-if="!loading && !error"
    :title="title"
    :items="podcasts"
    :route="href"
    :button-text="buttonText"
  >
    <template #item="{ item, first }">
      <PresentationItem
        :class="!isPhone && first ? 'me-3' : ''"
        :name="item.title"
        :route="route(item)"
        :image-url="item.imageUrl"
        :description="item.description"
        :vertical="!isPhone && first"
      >
        <template #after-image>
          <PodcastPlayButton
            :podcast="item"
            :hide-play="false"
            :show-processing="false"
          />
        </template>
      </PresentationItem>
    </template>
  </PresentationLayout>
  <ClassicLoading
    v-else
    :loading-text="loading ? $t('Loading emissions ...') : undefined"
    :error-text="error ? $t(`Error`) : undefined"
  />
</template>

<script setup lang="ts">
import classicApi from "../../../api/classicApi";
import {useErrorHandler} from "../../composable/useErrorHandler";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { Emission } from "@/stores/class/general/emission";
import { onMounted, Ref, ref } from "vue";
import { AxiosError } from "axios";
import {useResizePhone} from "../../composable/useResizePhone";
import { ListClassicReturn } from "../../../stores/class/general/listReturn";

import PresentationLayout from "../../layouts/PresentationLayout.vue"; 
import { Podcast, SimplifiedPodcast, simplifiedToFull } from "../../../stores/class/general/podcast";

import PresentationItem from "../../layouts/PresentationItem.vue"; 
import PodcastPlayButton from "./PodcastPlayButton.vue"; 
import { RouteLocationRaw } from "vue-router";
import { podcastApi, PodcastSort } from "../../../api/podcastApi";

//Props 
const props = defineProps({
  organisationId: { default: undefined, type: String },
  title: { default: "", type: String },
  href: { default: undefined, type: String },
  buttonText: { default: undefined, type: String },
  isDescription: { default: false, type: Boolean },
  rubriquesId: { default: [], type: Array<number> },
})

//Data 
const loading = ref(true);
const error = ref(false);
const podcasts: Ref<Array<Podcast>> = ref([]);
  
//Composables
const { isPhone } = useResizePhone();
const {handle403} = useErrorHandler();

onMounted(()=>fetchNext())

//Methods
async function fetchNext(): Promise<void> {
  loading.value = true;
  try {
    // Retrieve latest emissions
    const emissions = await classicApi.fetchData<ListClassicReturn<Emission>>({
      api: 0,
      path: "emission/search",
      parameters: {
        first: 0,
        size: 5,
        organisationId: props.organisationId,
        sort: "LAST_PODCAST_DESC",
        rubriqueId: props.rubriquesId
      },
      specialTreatement: true,
    });

    const promises: Array<Promise<SimplifiedPodcast>> = [];

    for (let i = 0; i < emissions.result.length; i++) {
      promises.push(podcastApi.search({
        first: 0,
        pageSize: 1,
        organisationId: [props.organisationId],
        emissionId: [emissions.result[i].emissionId],
        sort: PodcastSort.DATE,
        rubriqueId: props.rubriquesId
      }).then(r => r.result[0]));
    }

    // Retrieve the podcasts for these emissions
    const data = await Promise.all(promises);

    podcasts.value = podcasts.value.concat(
      data.filter((em: SimplifiedPodcast | null) => null !== em).map(p => {
        // Get emission from podcast
        const emission = emissions.result.find(e => e.emissionId === p.emissionId);
        // Create full podcast from simplified + emission
        return simplifiedToFull(p, emission.orga, emission);
      })
    );
    loading.value = false;
  } catch (errorWs) {
    handle403(errorWs as AxiosError);
    error.value = true;
  }
  loading.value = false;
}

function route(podcast: Podcast): RouteLocationRaw {
  return {
    name: 'podcast',
    params: { podcastId: podcast.podcastId }
  }
}
</script>
