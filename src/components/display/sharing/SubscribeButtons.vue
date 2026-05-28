<template>
    <div
        v-if="subscriptionsDisplay.length || rssUrl"
        class="subscribe-buttons-container"
        :class="{ 'justify-center': justifyCenter }"
    >
        <div ref="subscribeButtonsContainer">
            <a
                v-for="(sub, index) in shownLinks"
                :id="'subLink' + sub.name"
                :key="sub.name"
                rel="noreferrer noopener"
                target="_blank"
                :class="{
                    first: 0 === index,
                    last: subscriptionsDisplay.length - 1 === index,
                    mono,
                    small
                }"
                class="btn share-btn"
                :href="sub.url"
                :title="t('New window', {text: sub.title})"
            >
                <component
                    :is="sub.icon"
                    :fill-color="fillColor(sub)"
                    :size="iconSize"
                    non-decorative
                />
            </a>
        </div>
        <a
            v-if="!noRss"
            id="rss-suscribe-button"
            rel="noreferrer noopener"
            target="_blank"
            class="btn share-btn"
            :class="{ mono, small }"
            :href="rssUrl"
            :title="t('New window', {text: t('Rss feed')})"
        >
            <RssIcon :fill-color="fillColor()" :size="iconSize" />
        </a>

        <button
            v-if="limit === undefined"
            v-show="hiddenLinks.length"
            id="subscribe-buttons-dropdown"
            class="btn share-btn mx-2"
            :title="t('See more')"
        >
            <PlusIcon />
        </button>
        <ClassicPopover
            target="subscribe-buttons-dropdown"
            popover-class="popover-z-index"
            :only-click="true"
            :left-pos="true"
        >
            <a
                v-for="link in hiddenLinks"
                :key="link.name"
                rel="noreferrer noopener"
                target="_blank"
                class="octopus-dropdown-item justify-content-start d-flex align-items-center realLink"
                :href="link.url"
                :title="t('New window', {text: link.title})"
            >
                <component
                    :is="link.icon"
                    :fill-color="fillColor(link)"
                    class="me-1"
                />
                {{ link.title }}
            </a>
        </ClassicPopover>
    </div>
</template>

<script setup lang="ts">
import PlusIcon from "vue-material-design-icons/Plus.vue";
import RssIcon from "vue-material-design-icons/Rss.vue";
import { useApiStore } from "../../../stores/ApiStore";
import ClassicPopover from "../../misc/ClassicPopover.vue";
import { Emission } from "@/stores/class/general/emission";
import { type Component, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { Playlist } from "../../../stores/class/general/playlist";
import { useSharePlatforms } from "../../composable/share/useSharePlatforms";
import { useResizePhone } from "../../composable/useResizePhone";

type Link = {
    name: string;
    icon: Component;
    title: string;
    color?: string;
    url: string | undefined;
};

//Props 
const props = withDefaults(defineProps<{
    content: Emission|Playlist;
    windowWidth?: number;
    justifyCenter?: boolean;
    /** Display the icons with just the octopus primary color */
    mono?: boolean;
    /** If set, limit the number of icons (will not display plus button) */
    limit?: number;
    /** Disable the RSS icon */
    noRss?: boolean;
    /** Smaller icons */
    small?: boolean;
}>(), {
    windowWidth: 0,
    justifyCenter: true,
    mono: false,
    limit: undefined,
    noRss: false,
    small: false
});

//Composables
const { t } = useI18n();
const apiStore = useApiStore();
const { getPlatformsWithLinks, initPlatforms } = useSharePlatforms();
const { isPhone } = useResizePhone();

//Computed
const maxElements = computed((): number => {
    let number = 5;
    if (isPhone.value) {
        number = 3;
    }

    if (props.noRss) {
        number += 1;
    }
    if (subscriptionsDisplay.value.length <= number + 1) {
        number = subscriptionsDisplay.value.length;
    }

    if (props.limit !== undefined) {
        return Math.min(number, props.limit);
    } else {
        return number;
    }
});

const subscriptionsDisplay = computed(() => {
    return getPlatformsWithLinks(props.content.annotations);
});

const shownLinks = computed((): Array<Link> => {
    return subscriptionsDisplay.value.slice(0, maxElements.value);
});

const hiddenLinks = computed((): Array<Link> => {
    return subscriptionsDisplay.value.slice(maxElements.value);
});

const rssUrl = computed(() => {
    const api = apiStore.apiUrl + "rss/";
    if ((props.content as Emission).emissionId) {
        return api + "emission/" + (props.content as Emission).emissionId + ".rss";
    }
    if ((props.content as Playlist).playlistId) {
        return api + "playlist/" + (props.content as Playlist).playlistId + ".rss";
    }
    return undefined;
});

const iconSize = computed((): number => {
    return props.small ? 20 : 24;
});

onMounted(() => {
    const orga = 'orga' in props.content ? props.content.orga : props.content.organisation;
    initPlatforms(orga.id);
});

function fillColor(link?: Link): string|undefined {
    if (props.mono === true) {
        return 'white';
    } else {
        return link?.color;
    }
}
</script>

<style scoped lang="scss">
.subscribe-buttons-container {
    align-self: center;
    display: inline-flex;
    width: 100%;

    &.justify-center {
        justify-content: center;
    }

    & > div {
        display: inline-flex;
        justify-content: flex-start;
        overflow: hidden;
        width: fit-content;
    }

    @media (width <= 960px) {
        margin-top: 0.8rem;
    }
}

.share-btn {
  margin-right: .5rem;
  margin-left: .5rem;

  &.mono {
    background-color: var(--octopus-primary);
  }

  &.small {
    height: 1.8rem !important;
    width: 1.8rem !important;
    margin-right: .2rem;
    margin-left: .2rem;
  }
}
</style>
