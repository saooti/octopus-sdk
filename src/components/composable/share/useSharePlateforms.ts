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
import YoutubeIcon from "vue-material-design-icons/Youtube.vue";
import SpotifyIcon from "vue-material-design-icons/Spotify.vue";
import { Annotations } from "@/stores/class/general";
import { computed, type Component } from "vue";
import { useI18n } from "vue-i18n";

export interface SharePlatform {
    /** ID of the platform */
    name: string;
    /** Display text for the platform */
    label: string;
    /** Icon of the platform */
    icon: Component;
    /** Title for buttons */
    title: string;
    /** Color of the icon */
    color: string;
}

export interface SharePlatformUrl extends SharePlatform {
    /** URL to the platform */
    url: string;
}

export const useSharePlatforms = () => {
    const { t } = useI18n();
    
    const platforms = computed((): Array<SharePlatform> => {
        return [{
            name: "applePodcast",
            label: t("Apple podcast"),
            icon: ApplePodcastIcon,
            title: "Apple Podcast | iTunes",
            color:"#aa1dd3"
        }, {
            name: "deezer",
            label: t("Deezer"),
            icon: DeezerIcon,
            title: "Deezer",
            color:"#a238ff",
        }, {
            name: "spotify",
            label: t("Spotify"),
            icon: SpotifyIcon,
            title: "Spotify",
            color: "#1ed760",
        }, {
            name: "amazon",
            label: t("Amazon"),
            icon: AmazonMusicIcon,
            title: "Amazon Music",
            color: "#0c6cb3",
        }, {
            name: "iHeart",
            label: t("iHeart"),
            icon: IHeartIcon,
            title: "iHeart",
            color:"#e11b22"
        }, {
            name: "playerFm",
            label: t("Player FM"),
            icon: PlayerFmIcon,
            title: "PlayerFM",
            color:"#bb202a"
        }, {
            name: "pocketCasts",
            label: t("Pocket Casts"),
            icon: PocketCastIcon,
            title: "Pocket Casts",
            color:"#f43e37"
        }, {
            name: "podcastAddict",
            label: t("Podcast Addict"),
            icon: PodcastAddictIcon,
            title: "Podcast Addict",
            color:"#f4842d"
        }, {
            name: "radioline",
            label: t("Radioline"),
            icon: RadiolineIcon,
            title: "Radioline",
            color:"#1678bd"
        }, {
            name: "tunein",
            label: t("Tunein"),
            icon: TuninIcon,
            title: "TuneIn",
            color:"#36b4a7"
        }, {
            name: "youtube",
            label: t("YouTube Music"),
            icon: YoutubeIcon,
            title: "YouTube Music",
            color: "#fe0000",
        }, {
            name: "castbox",
            label: t("Castbox"),
            icon: CastboxIcon,
            title: "Castbox",
            color: "#fe6222",
        }, {
            name: "podbean",
            label: t("PodBean"),
            icon: PodbeanIcon,
            title: "PodBean",
            color: "#428200",
        }, {
            name: "podcastrepublic",
            label: t("Podcast Republic"),
            icon: PodcastRepublicIcon,
            title: "Podcast Republic",
            color: "#5c85dd",
        }];
    });

    /**
     * Get platforms with their associated links.
     * A platform with no link will not be included
     * @param annotations The annotations of the element for which to get the
                          platforms links
     */
    function getPlatformsWithLinks(annotations:Annotations|undefined): Array<SharePlatformUrl> {
        const ary: Array<SharePlatformUrl> = [];
        platforms.value.forEach(p => {
            const url = getUrl(p.name, annotations);
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
        return externaliseLinks(
            annotations?.[sub] as string | undefined,
        );
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
        platforms
    }
};
