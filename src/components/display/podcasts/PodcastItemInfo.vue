<template>
    <div class="podcast-item-info">
        <div class="podcast-item-status text-secondary h6 mx-2">
            <time :datetime="podcast.pubDate">
                {{ date }}
            </time>

            <PodcastSeasonInfo :podcast="podcast" />
        </div>

        <router-link
            :to="{
                name: 'podcast',
                params: { podcastId: podcast.podcastId },
            }"
            class="text-dark flex-grow-1 title-podcast-item basic-line-clamp three-line"
            :title="t('Episode name page', { name: podcast.title })"
        >
            {{ podcast.title }}
        </router-link>

        <PodcastPlayBar
            v-if="state.emissionsPage.progressBar"
            :display-buton-play="true"
            :podcast="podcast"
            class="me-2"
        />

        <div class="mx-2 d-flex align-items-center justify-content-between mt-2">
            <div v-if="isPodcastmaker" class="useless-div-for-podcastmaker" />
            <AnimatorsItem
                v-if="podcast.animators && 0 !== podcast.animators.length"
                class="w-0 flex-grow-1"
                :animator="podcast.animators[0]"
            />
            <router-link
                v-if="!isPodcastmaker"
                :to="{
                    name: 'productor',
                    params: { productorId: podcast.organisation.id },
                }"
                class="text-dark producer-podcast-item"
            >
                {{ "© " + orgaNameDisplay }}
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import AnimatorsItem from "./AnimatorsItem.vue";
import {useOrgaComputed} from "../../composable/useOrgaComputed";
import { computed, defineAsyncComponent } from "vue";
import { Podcast } from "../../../stores/class/general/podcast";
import { state } from "../../../stores/ParamSdkStore";
import { useI18n } from "vue-i18n";
import PodcastSeasonInfo from "./PodcastSeasonInfo.vue";
import { useDayjs } from "../../composable/useDayjs";
const PodcastPlayBar = defineAsyncComponent(
    () => import("./PodcastPlayBar.vue"),
);

//Props 
const props = defineProps({
    podcast: { default: () => ({}), type: Object as () => Podcast },
})

//Composables
const { t } = useI18n();
const { isPodcastmaker } = useOrgaComputed();

//Computed
const { formatDate } = useDayjs();

const date = computed((): string => {
    return formatDate(props.podcast.pubDate);
});

const orgaNameDisplay = computed(() =>{
    if (props.podcast.organisation.name.length > 30) {
        return props.podcast.organisation.name.substring(0, 30) + "...";
    }
    return props.podcast.organisation.name;
});
</script>

<style scoped lang="scss">
.title-podcast-item {
    font-weight: 700;
    margin: 0.25rem 0.5rem 0.5rem;
    flex-grow: 1;
    font-size: 0.9rem;
    min-height: 3rem;
    line-height: 1rem;
}

.producer-podcast-item {
    font-size: 0.55rem;
    color: var(--octopus-gray-text);
    flex-shrink: 0;
}

.podcast-item-status {
    display: flex;
    justify-content: space-between;
}
</style>
