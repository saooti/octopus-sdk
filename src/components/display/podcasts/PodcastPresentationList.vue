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
                :tags="tags.get(item.podcastId)"
                :additional-info="additionalInfo.get(item.podcastId)"
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
import { onMounted, reactive, Ref, ref, watch } from "vue";
import { AxiosError } from "axios";
import {useResizePhone} from "../../composable/useResizePhone";
import { ListClassicReturn } from "../../../stores/class/general/listReturn";

import PresentationLayout from "../../layouts/PresentationLayout.vue"; 
import { Podcast, SimplifiedPodcast, simplifiedToFull } from "../../../stores/class/general/podcast";

import PresentationItem from "../../layouts/PresentationItem.vue"; 
import PodcastPlayButton from "./PodcastPlayButton.vue"; 
import { RouteLocationRaw } from "vue-router";
import { podcastApi, PodcastSort } from "../../../api/podcastApi";
import { usePresentationItem } from "../../composable/usePresentationItem";

//Props 
const props = withDefaults(defineProps<{
    /**
     * ID of the organisation
     */
    organisationId?: string;
    /**
     * Title of the section
     */
    title?: string;
    /**
     * Link to the "more" section
     */
    href?: string;
    /**
     * Label for the "more" button
     */
    buttonText?: string;
    /**
     * Display podcasts exclusively from these rubriques
     */
    rubriquesId?: Array<number>;
    /**
     * Mode of retrieval for podcasts
     */
    retrievalMode?: 'by-emission'|'any';
}>(), {
    retrievalMode: 'by-emission'
});

//Data 
const loading = ref(true);
const error = ref(false);
const podcasts: Ref<Array<Podcast>> = ref([]);
const tags = reactive(new Map<number, Array<string>>());
const additionalInfo = reactive(new Map<number, Array<string>>());
  
//Composables
const { isPhone } = useResizePhone();
const { handle403 } = useErrorHandler();
const { tagsFor, additionalInfoFor } = usePresentationItem();

onMounted(fetchNext);

watch(podcasts, async () => {
    podcasts.value.forEach(async (podcast) => {
        if (!tags.has(podcast.podcastId)) {
            const [t, i] = await Promise.all([
                tagsFor(podcast),
                additionalInfoFor(podcast)
            ]);
            tags.set(podcast.podcastId, t);
            additionalInfo.set(podcast.podcastId, i);
        }
    });
});

//Methods
async function fetchNext(): Promise<void> {
    loading.value = true;
    try {
        let func: () => Promise<Array<Podcast>>;
        if (props.retrievalMode === 'any') {
            func = fetchPodcasts;
        } else {
            func = fetchPodcastsByEmission;
        }
        const result = await func();

        // Sort podcasts by pub date so that the most recent one is focused
        podcasts.value = result.sort((p1, p2) => {
            return new Date(p2.pubDate).getTime() - new Date(p1.pubDate).getTime();
        });
    
        loading.value = false;
    } catch (errorWs) {
        console.error(errorWs);
        handle403(errorWs as AxiosError);
        error.value = true;
    }
    loading.value = false;
}

async function fetchPodcasts(): Promise<Array<Podcast>> {
    const response = await podcastApi.searchFull({
        first: 0,
        size: 5,
        organisationId: [props.organisationId],
        sort: PodcastSort.DATE,
        rubriqueId: props.rubriquesId
    }, true);

    return response.result;
}

async function fetchPodcastsByEmission(): Promise<Array<Podcast>> {
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
        specialTreatement: true
    });

    const promises: Array<Promise<SimplifiedPodcast>> = [];

    for (let i = 0; i < emissions.result.length; i++) {
        promises.push(podcastApi.search({
            first: 0,
            size: 1,
            organisationId: [props.organisationId],
            emissionId: [emissions.result[i].emissionId],
            sort: PodcastSort.DATE,
            rubriqueId: props.rubriquesId
        }, true).then(r => r.result[0]));
    }

    // Retrieve the podcasts for these emissions
    const data = await Promise.all(promises);

    return data.filter((em: SimplifiedPodcast | null) => null !== em && undefined !== em).map(p => {
        // Get emission from podcast
        const emission = emissions.result.find(e => e.emissionId === p.emissionId);
        // Create full podcast from simplified + emission
        return simplifiedToFull(p, emission.orga, emission);
    });
}

function route(podcast: Podcast): RouteLocationRaw {
    return {
        name: 'podcast',
        params: { podcastId: podcast.podcastId }
    }
}
</script>
