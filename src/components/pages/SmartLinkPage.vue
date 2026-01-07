<template>
    <div v-if="element" class="background">
        <img :src="useProxyImageUrl(element.imageUrl, '1600')">
    </div>
    <article v-if="element">
        <!-- Top part of smartlink, with image, title and description -->
        <div class="d-flex">
            <img
                v-lazy="useProxyImageUrl(element.imageUrl, '250')"
                width="250"
                height="250"
                class="img-box"
                aria-hidden="true"
                alt=""
            >
            <div class="ms-4">
                <h1>{{ title }}</h1>
                <p>
                    {{ element.description }}
                </p>
            </div>
        </div>

        <!-- Links -->
        <div class="platforms">
            <div
                v-for="platform in sharePlatforms"
                :key="platform.name"
                class="platform-btn"
            >
                <button class="btn w-100" @click="openLink(platform.url)">
                    <!-- Icon of platform -->
                    <component
                        :is="platform.icon"
                        :fill-color="platform.color"
                        class="me-2"
                    />

                    {{ platform.label }}
                </button>
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useSeoTitleUrl } from '../composable/route/useSeoTitleUrl';

import { Emission } from '../../stores/class/general/emission';
import { Playlist } from '../../stores/class/general/playlist';
import { playlistApi } from '../../api/playlistApi';
import { emissionApi } from '../../api/emissionApi';
import { useImageProxy } from '../composable/useImageProxy';
import { useSharePlatforms } from '../composable/share/useSharePlateforms';

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
});

/** Title of the element displayed */
const title = computed((): string => {
    if (element.value as Playlist) {
        return (element.value as Playlist).title;
    }
    if (element.value as Emission) {
        return (element.value as Emission).name;
    }
    return '';
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

function openLink(link: string): void {
    window.open(link, '_blank').focus();
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
        // Change image
        filter: blur(40px) sepia(0.4);

        @media (width <= 960px) {
            // Better display for small screens
            filter: blur(15px);
            transform: scale(1.1);
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

    .img-box {
        // Move image
        margin-top: -70px;
        margin-left: 20px;
        margin-bottom: 0px;

        // Add a border
        border: 2px solid var(--background);
        border-radius: var(--border-radius);

        @media (width <= 960px) {
            margin: -70px auto 0px;
        }
    }

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
            // Center content horizontally
            justify-content: center;
            // Center content vertically
            align-items: center;
        }
    }
}
</style>
