<template>
    <div class="podcast-item-info">
        <div class="podcast-item-status text-secondary h6 mx-2">
            <time :datetime="podcast.pubDate">
                {{ date }}
            </time>

            <div class="podcast-item-season">
                {{ formatSeason(podcast) }}
                <BullhornIcon
                    v-if="podcast.seasonEpisodeType === PodcastType.TRAILER"
                    :title="$t('Podcast type - Trailer')"
                />
                <GiftIcon
                    v-if="podcast.seasonEpisodeType === PodcastType.BONUS"
                    :title="$t('Podcast type - Bonus')"
                />
            </div>
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
import dayjs from "dayjs";
import { computed, defineAsyncComponent } from "vue";
import { Podcast, PodcastType } from "../../../stores/class/general/podcast";
import { state } from "../../../stores/ParamSdkStore";
import { useI18n } from "vue-i18n";
import { useSeasonsManagement } from "../../composable/useSeasonsManagement";
import BullhornIcon from 'vue-material-design-icons/Bullhorn.vue';
import GiftIcon from 'vue-material-design-icons/Gift.vue';
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
const { formatSeason } = useSeasonsManagement();

//Computed
const date = computed(() => {
    let format = "D MMMM YYYY";
    if (state.generalParameters.showTimeWithDates === true) {
        format = "D MMMM YYYY - HH:mm";
    }
    return dayjs(props.podcast.pubDate).format(format);
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

.podcast-item-season {
    display: flex;
    --icon-size: 0.8rem;

    .material-design-icon {
        position: relative;
        top: -3px;
        margin-left: 4px;

        width: var(--icon-size);
        height: var(--icon-size);
        color: var(--octopus-primary);
    }
}
</style>
