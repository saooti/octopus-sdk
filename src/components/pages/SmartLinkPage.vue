<template>
    <div v-if="element" class="background">
        <img :src="useProxyImageUrl(element.imageUrl, '1600')">
    </div>
    <article v-if="element">
        <!-- Top part of smartlink, with image, title and description -->
        <div class="content">
            <div class="left">
                <img
                    v-lazy="useProxyImageUrl(element.imageUrl, '250')"
                    width="250"
                    height="250"
                    class="img-box"
                    aria-hidden="true"
                    alt=""
                >
                <!-- Play button when not viewing with phone -->
                <button
                    v-if="latestPodcast"
                    class="btn btn-primary play-button pe-3 hide-phone"
                    @click="playLatestPodcast"
                >
                    <PlayIcon class="me-2" />
                    {{ $t('SmartLink - Listen to latest episode') }}
                </button>
            </div>
            <h1>{{ title }}</h1>
            <div v-html="displayHelper.urlify(element.description)" />

            <!-- Play button when viewing with phone -->
            <button
                v-if="latestPodcast"
                class="btn btn-primary play-button pe-3 mt-4 show-phone-flex"
                @click="playLatestPodcast"
            >
                <PlayIcon class="me-2" />
                {{ $t('SmartLink - Listen to latest episode') }}
            </button>
        </div>

        <!-- Links -->
        <div class="platforms">
            <div
                v-for="platform in sharePlatforms"
                :key="platform.name"
                class="platform-btn"
            >
                <button
                    class="btn w-100"
                    :style="gradient(platform)"
                    @click="openLink(platform.url)"
                >
                    <!-- Icon of platform -->
                    <component
                        :is="platform.icon"
                        :size="36"
                        :fill-color="platform.color"
                        class="me-2"
                    />

                    <span class="platform-label">{{ platform.title }}</span>
                </button>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <a target="_blank" href="/">
                <span>{{ $t('SmartLink - Made by') }}</span>
                <img
                    src="/img/logo_saooti_play_black.svg"
                    height="24"
                    class="ms-2"
                >
            </a>
            <a
                v-if="podcastmakerElementUrl"
                target="_blank"
                :href="podcastmakerElementUrl"
            >
                <span v-if="playlistId">{{ $t('SmartLink - To playlist on podcastmaker', { organisation: organisation.name }) }}</span>
                <span v-else-if="emissionId">{{ $t('SmartLink - To emission on podcastmaker', { organisation: organisation.name }) }}</span>
            </a>
        </div>
    </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useSeoTitleUrl } from '../composable/route/useSeoTitleUrl';

import PlayIcon from "vue-material-design-icons/Play.vue";

import { Emission } from '../../stores/class/general/emission';
import { Playlist } from '../../stores/class/general/playlist';
import { playlistApi } from '../../api/playlistApi';
import { emissionApi } from '../../api/emissionApi';
import { useImageProxy } from '../composable/useImageProxy';
import { SharePlatform, useSharePlatforms } from '../composable/share/useSharePlatforms';
import { Organisation, OrganisationAttributes } from '../../stores/class/general/organisation';
import { organisationApi } from '../../api/organisationApi';
import { Podcast } from '@/stores/class/general/podcast';
import { usePlayerStore } from '../../stores/PlayerStore';
import { podcastApi, PodcastSort } from '../../api/podcastApi';
import { useSharePath } from '../composable/share/useSharePath';
import displayHelper from '../../helper/displayHelper';

const { updatePathParams } = useSeoTitleUrl();
const { useProxyImageUrl } = useImageProxy();
const { getPlatformsWithLinks } = useSharePlatforms();

/** Props used when displaying a playlist */
interface PlaylistProps {
    /** ID of the playlist to display */
    playlistId: number;
    /** Disallow use of emission id */
    emissionId?: never;
}

/** Props used when displaying an emission */
interface EmissionProps {
    /** Disallow use of playlist id */
    playlistId?: never;
    /** ID of the emission to display */
    emissionId: number;
}

const { playlistId, emissionId } = defineProps<PlaylistProps|EmissionProps>();

/** The currently displayed element, if any */
const element = ref<Playlist|Emission|null>(null);

onMounted(async() => {
    // Retrieve element
    if (playlistId) {
        element.value = await playlistApi.get(playlistId);
    } else if (emissionId) {
        element.value = await emissionApi.get(emissionId);
    } else {
        console.error('No content defined');
    }

    // Update title & path
    updatePathParams(title.value);

    getOrganisationAttributes();
    getLatestPodcast();
});

/** Title of the element displayed */
const title = computed((): string => {
    if (playlistId) {
        return (element.value as Playlist).title;
    }
    if (emissionId) {
        return (element.value as Emission).name;
    }
    return '';
});

/** The organisation associated with the element */
const organisation = computed((): Organisation|undefined => {
    if (!element.value) {
        return;
    }

    if (playlistId) {
        return (element.value as Playlist).organisation;
    } else if (emissionId) {
        return (element.value as Emission).orga;
    }
    return undefined;
});

/** The URL to the podcastmaker of the organisation, if any */
const organisationAttributes = ref<OrganisationAttributes|null>(null);
const { getSharePath } = useSharePath();

async function getOrganisationAttributes(): Promise<void> {
    if (organisation.value) {
        organisationAttributes.value = await organisationApi.getAttributes(organisation.value.id);
    }
}

/** The URL to the element on the podcastmaker, or original platform, if any */
const podcastmakerElementUrl = computed((): string|undefined => {
    // Retrieve full URL of element
    if (playlistId) {
        return getSharePath({ name: 'playlist', params: { playlistId }}, organisationAttributes.value);
    } else if (emissionId) {
        return getSharePath({ name: 'emission', params: { emissionId }}, organisationAttributes.value);
    }
    return undefined;
});

/**
 * The available share platforms for the element
 */
const sharePlatforms = computed(() => {
    if (!element.value) {
        return [];
    }
    return getPlatformsWithLinks(element.value.annotations);
});

function gradient(platform: SharePlatform): Record<string, string> {
    return {
        '--gradient-color': platform.color
    };
}

function openLink(link: string): void {
    window.open(link, '_blank').focus();
}

const playerStore = usePlayerStore();
const latestPodcast = ref<Podcast|null>(null);

async function getLatestPodcast(): Promise<void> {
    if (playlistId) {
        const content = await playlistApi.getContent(playlistId);
        if (content.length > 0) {
            const id = content[content.length - 1].podcastId;
            latestPodcast.value = await podcastApi.get(id);
        }
    } else if (emissionId) {
        const result = await podcastApi.searchFull({
            emissionId,
            sort: PodcastSort.DATE,
            size: 1
        });

        if (result.count > 0) {
            latestPodcast.value = result.result[0];
        }
    }
}

function playLatestPodcast(): void {
    if (!latestPodcast.value) {
        return;
    }

    playerStore.playerPlay(latestPodcast.value);
}
</script>

<style scoped lang="scss">
.background {
    width: 100%;
    height: 100%;
    overflow: hidden;
    // Do not take place in page
    position: absolute;
    // Make rest of page appear in front of image
    z-index: -1;

    img {
        width: 100%;
        height: 100%;
        // Background image display
        object-fit: cover;
        // Blur image
        filter: blur(40px) sepia(0.4);
        transform: scale(1.1);

        @media (width <= 960px) {
            // Better display for small screens
            filter: blur(15px);
        }
    }
}

article {
    // Set variables
    --background: white;
    --border-radius: 20px;

    margin: 8rem auto 0;
    padding: 20px;
    width: 900px;
    border-radius: var(--border-radius);

    // Background for card
    background: var(--background);
    // Subtle border
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);

    @media (width <= 960px) {
        // Adapt card for small screens
        margin-top: 5rem;
        width: 100%;
    }

    .play-button {
        width: 250px;

        @media (width <= 960px) {
            // Center button
            margin-right: auto !important;
            margin-left: auto !important;
        }

        &::before {
            // Remove additional content
            display: none;
        }
    }

    .left {
        // Align left
        float: left;

        @media (width <= 960px) {
            // On small screens, center content
            margin: 0 auto;
            float: none;
        }
    }

    .img-box {
        // Move image
        margin-top: -70px;
        margin-bottom: 0px;

        // Move image left with content going to its right, and below it
        margin-right: 20px;

        // Add a border
        border: 2px solid var(--background);
        border-radius: var(--border-radius);

        @media (width <= 960px) {
            margin: -70px auto 10px;
        }
    }

    // Section for title & description of content
    .content {
        margin-left: 20px;

        @media (width <= 960px) {
            margin-left: 0;
        }

        h1 {
            text-align: start !important;

            @media (width <= 960px) {
                text-align: center !important;
            }
        }
    }

    // Section for displaying platforms
    .platforms {
        // Allow display on columns
        display: flex;
        flex-wrap: wrap;
        margin-top: 50px;

        @media (width <= 960px) {
            // Lower top margin when on mobile
            margin-top: 20px;
        }

        .platform-btn {
            display: flex;
            padding: 4px 8px;
            // Display on two columns
            flex-basis: 50%;
            // Center elements when possible
            margin: auto;

            @media (width <= 960px) {
                // On small screens, buttons take full width
                flex-basis: 100%;
            }
        }

        .btn {
            display: flex;
            height: 52px;
            // Center content vertically
            align-items: center;
            padding-left: 40px;
            background: linear-gradient(155deg, var(--octopus-secondary) 30%, oklch(from var(--gradient-color) l c h / 40%));
            .platform-label {
                margin-left: 30px;
            }

            &:hover {
                background: linear-gradient(155deg, var(--octopus-secondary) 30%, oklch(from var(--gradient-color) l c h / 100%));
            }

        }
    }
}

.footer {
    cursor: pointer;
    margin: 34px auto 0;
    font-size: 14px;
    display: flex;
    justify-content: space-between;

    @media (width <= 960px) {
        flex-direction: column-reverse;
        align-items: center;
    }

    a {
        display: flex;
        align-items: center;
        color: var(--octopus-color-text);

        &:hover {
            color: var(--octopus-primary);
        }
    }
}
</style>
