<template>
    <span class="podcast-item-season">
        {{ formatSeason(podcast) }}
        <BullhornIcon
            v-if="podcast.seasonEpisodeType === PodcastType.TRAILER"
            :title="$t('Podcast type - Trailer')"
        />
        <GiftIcon
            v-if="podcast.seasonEpisodeType === PodcastType.BONUS"
            :title="$t('Podcast type - Bonus')"
        />
    </span>
</template>

<script setup lang="ts">
import { Podcast, PodcastType } from "../../../stores/class/general/podcast";
import BullhornIcon from 'vue-material-design-icons/Bullhorn.vue';
import GiftIcon from 'vue-material-design-icons/Gift.vue';
import { useSeasonsManagement } from "../../composable/useSeasonsManagement";

const { podcast } = defineProps<{
    /** Podcast for which to display info */
    podcast: Podcast;
}>();

const { formatSeason } = useSeasonsManagement();
</script>

<style scoped lang="scss">
.podcast-item-season {
    display: inline-flex;
    align-items: center;
    --icon-size: 0.8rem;

    .material-design-icon {
        //position: relative;
        //top: -3px;
        margin-left: 4px;

        width: var(--icon-size);
        height: var(--icon-size);
        color: var(--octopus-primary);
    }
}
</style>
