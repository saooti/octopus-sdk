import { OrganisationAttributes } from "@/stores/class/general/organisation";
import { RouteLocationAsRelativeTyped, useRouter } from "vue-router";
import { useSeoTitleUrl } from "../route/useSeoTitleUrl";

export const useSharePath = () => {
    const router = useRouter();
    const { stringUrlEncode } = useSeoTitleUrl();

    /** Retrieve the URL of the podcastmaker, if any */
	function getPodcastMakerUrl(attributes?: OrganisationAttributes): string|undefined {
        if (attributes?.podcastmakerUrl) {
            return attributes.podcastmakerUrl;
        }
	}

	/**
	 * Retrieve the base URL for sharing.
	 * If the podcastmaker URL is defined, it will be used.
	 * Otherwise, the frontend URL will be used.
	 * @param attributes The attributes defined on the organisation, from
	                     which the podcastmaker url is extracted
	 */
	function getBaseSharePath(attributes?: OrganisationAttributes): string {
	    const pmUrl = getPodcastMakerUrl(attributes);
	    if (pmUrl) {
	        return pmUrl;
	    } else {
	        return window.location.origin;
	    }
	}

    /**
     * Retrieve the full URL to a page, for sharing.
     * If the podcastmaker URL is set, the link will point to it.
	 * @param attributes The attributes defined on the organisation, from
	                     which the podcastmaker url is extracted
	 */
	function getSharePath(route: RouteLocationAsRelativeTyped, attributes?: OrganisationAttributes): string {
        const resolved = router.resolve(route);
        // Remove trailing slash
        const base = getBaseSharePath(attributes).replace(/\/$/, '');
        // Remove leading slash
        const path = resolved.path.replace(/^\//, '');
        return base + '/' + path;
	}

	type GetSmartLinkParam = {
	    /** The title of the element displayed by the smartlink page */
	    title?: string;
	    playlistId: number;
	    emissionId?: never;
	} | {
	    /** The title of the element displayed by the smartlink page */
	    title?: string;
	    playlistId?: never;
	    emissionId: number;
	};
	/**
	 * Retrieve the full URL for SmartLinks.
     * If the podcastmaker URL is set, the link will point to it.
     * @param params The parameters of the smartlink. The ID of the element is
                     required, whereas the title is optional, but if specified
                     it will be included in the URL.
	 * @param attributes The attributes defined on the organisation, from
	                     which the podcastmaker url is extracted
	 */
	function getSmartLink(params: GetSmartLinkParam, attributes?: OrganisationAttributes): string {
	    const title = params.title ? stringUrlEncode(params.title) : undefined;
	    if (params.playlistId) {
	        return getSharePath({ name: 'playlist-smartlink', params: { playlistId: params.playlistId, title }}, attributes);
	    } else if (params.emissionId) {
	        return getSharePath({ name: 'emission-smartlink', params: { emissionId: params.emissionId, title }}, attributes);
	    }
	}

	return {
	    getPodcastMakerUrl,
	    getSharePath,
	    getSmartLink
	}
}
