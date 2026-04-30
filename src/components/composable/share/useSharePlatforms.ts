import RadiolineIcon from "../../icons/RadiolineIcon.vue";
import TuninIcon from "../../icons/TuninIcon.vue";
import PodcastAddictIcon from "../../icons/PodcastAddictIcon.vue";
import PocketCastIcon from "../../icons/PocketCastIcon.vue";
import PlayerFmIcon from "../../icons/PlayerFmIcon.vue";
import IHeartIcon from "../../icons/IHeartIcon.vue";
import AmazonMusicIcon from "../../icons/AmazonMusicIcon.vue";
import DeezerIcon from "../../icons/DeezerIcon.vue";
import ApplePodcastIcon from "../../icons/ApplePodcastIcon.vue";
import CastboxIcon from "../../icons/CastboxIcon.vue"; 
import PodcastRepublicIcon from "../../icons/PodcastRepublicIcon.vue";
import PodbeanIcon from "../../icons/PodbeanIcon.vue"; 
import RadioFranceIcon from "../../icons/RadioFranceIcon.vue";
import YoutubeIcon from "vue-material-design-icons/Youtube.vue";
import SpotifyIcon from "vue-material-design-icons/Spotify.vue";
import { Annotations } from "@/stores/class/general";
import { h, markRaw, onMounted, ref, type Component } from "vue";
import { aggregatorsApi } from "../../../api/aggregatorsApi";
import { useAuthStore } from "../../../stores/AuthStore";
import { useNotificationStore } from "../../../stores/NotificationStore";
import ClassicAvatar from "../../misc/ClassicAvatar.vue";

export enum SharePlatformName {
    APPLE = "applePodcast",
    DEEZER = "deezer",
    SPOTIFY = "spotify",
    AMAZON = "amazon",
    I_HEART = "iHeart",
    PLAYER_FM = "playerFm",
    POCKET_CASTS = "pocketCasts",
    PODCAST_ADDICT = "podcastAddict",
    RADIOLINE = "radioline",
    TUNE_IN = "tunein",
    YOUTUBE = "youtube",
    CASTBOX = "castbox",
    PODBEAN = "podbean",
    PODCAST_REPUBLIC = "podcastrepublic",
    RADIO_FRANCE = "radiofrance"
}

export interface SharePlatform {
    /** ID of the platform */
    name: SharePlatformName|string;
    /** Icon of the platform */
    icon: Component;
    /** Display text/title for buttons */
    title: string;
    /** Color of the icon */
    color: string;
    /** Annotation to use for url */
    annotation?: string;
}

export interface SharePlatformUrl extends SharePlatform {
    /** URL to the platform */
    url: string;
}

export const PREDEFINED_PLATFORMS: Array<SharePlatform> = [{
    name: SharePlatformName.APPLE,
    icon: markRaw(ApplePodcastIcon),
    title: "Apple Podcast | iTunes",
    color: "#aa1dd3"
}, {
    name: SharePlatformName.DEEZER,
    icon: markRaw(DeezerIcon),
    title: "Deezer",
    color: "#a238ff",
}, {
    name: SharePlatformName.SPOTIFY,
    icon: markRaw(SpotifyIcon),
    title: "Spotify",
    color: "#1ed760",
}, {
    name: SharePlatformName.AMAZON,
    icon: markRaw(AmazonMusicIcon),
    title: "Amazon Music",
    color: "#0c6cb3",
}, {
    name: SharePlatformName.I_HEART,
    icon: markRaw(IHeartIcon),
    title: "iHeart",
    color: "#e11b22"
}, {
    name: SharePlatformName.PLAYER_FM,
    icon: markRaw(PlayerFmIcon),
    title: "Player FM",
    color: "#bb202a"
}, {
    name: SharePlatformName.POCKET_CASTS,
    icon: markRaw(PocketCastIcon),
    title: "Pocket Casts",
    color: "#f43e37"
}, {
    name: SharePlatformName.PODCAST_ADDICT,
    icon: markRaw(PodcastAddictIcon),
    title: "Podcast Addict",
    color: "#f4842d"
}, {
    name: SharePlatformName.RADIOLINE,
    icon: markRaw(RadiolineIcon),
    title: "Radioline",
    color: "#1678bd"
}, {
    name: SharePlatformName.TUNE_IN,
    icon: markRaw(TuninIcon),
    title: "TuneIn",
    color: "#36b4a7"
}, {
    name: SharePlatformName.YOUTUBE,
    icon: markRaw(YoutubeIcon),
    title: "YouTube Music",
    color: "#fe0000",
}, {
    name: SharePlatformName.CASTBOX,
    icon: markRaw(CastboxIcon),
    title: "Castbox",
    color: "#fe6222",
}, {
    name: SharePlatformName.PODBEAN,
    icon: markRaw(PodbeanIcon),
    title: "PodBean",
    color: "#428200",
}, {
    name: SharePlatformName.PODCAST_REPUBLIC,
    icon: markRaw(PodcastRepublicIcon),
    title: "Podcast Republic",
    color: "#5c85dd",
}, {
    name: SharePlatformName.RADIO_FRANCE,
    icon: markRaw(RadioFranceIcon),
    title: "Radio France",
    color: "#a90041",
}];

export const useSharePlatforms = () => {

    const platforms = ref<Array<SharePlatform>>([]);

    const { authOrgaId } = useAuthStore();
    const { addNotification } = useNotificationStore();

    onMounted(async (): Promise<void> => {
        platforms.value.push(...PREDEFINED_PLATFORMS);
        try {
            const customPlatforms = await aggregatorsApi.getAll(authOrgaId);
            customPlatforms.forEach(platform => {
                platforms.value.push({
                    name: platform.name,
                    title: platform.name,
                    icon: markRaw(() => h(ClassicAvatar, { name: platform.name, imageUrl: platform.image })),
                    color: "white",
                    annotation: `ptfaudio_${platform.name}`
                });
            });
        } catch(error) {
            addNotification({
                type: 'error',
                message: error
            });
        }
    });
    
    /**
     * Helper to retrieve configuration of a specific platform
     * @param platform The ID of the platform
     * @return The configuration found
     */
    function getPlatformConfiguration(platform: SharePlatformName): SharePlatform|undefined {
        return platforms.value.find(p => p.name === platform);
    }

    /**
     * Get platforms with their associated links.
     * A platform with no link will not be included
     * @param annotations The annotations of the element for which to get the
                          platforms links
     */
    function getPlatformsWithLinks(annotations: Annotations|undefined): Array<SharePlatformUrl> {
        const ary: Array<SharePlatformUrl> = [];
        platforms.value.forEach(p => {
            const url = getUrl(p.annotation ?? p.name, annotations);
            if (url) {
                ary.push({
                    ...p,
                    url
                });
            }
        })
        return ary;
    }

    function getUrl(sub: string, annotations: Annotations|undefined): string | undefined {
        return externaliseLinks(annotations?.[sub] as string | undefined);
    }

    function externaliseLinks(link?: string): string | undefined {
        if (!link) {
            return link;
        }
        link = link.trim();
        return !link.startsWith("http") && !link.startsWith("//")
            ? "//" + link
            : link;
    }

    return {
        getPlatformsWithLinks,
        getPlatformConfiguration,
        platforms
    }
};
