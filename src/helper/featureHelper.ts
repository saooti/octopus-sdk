import { organisationApi } from "@/api";

/**
 * Enum of the features enabled on a given organisation
 */
export enum Feature {
    /** Podcast can be created from videos */
    Video
}

/**
 * Check whether the organisation identified by `organisationId` has the feature
 * `feature` enabled.
 * @param organisationId The ID of organisation
 * @param feature The feature to check
 * @returns True if the feature is enabled for the organisation
 */
export async function hasFeature(organisationId: string, feature: Feature): Promise<boolean> {
    if (feature === Feature.Video) {
        const config = await organisationApi.getVideoConfig(organisationId);
        return config.active;
    }
    return false;
}
