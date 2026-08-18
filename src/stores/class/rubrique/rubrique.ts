export interface Rubrique {
    /** Name of the rubrique */
    name: string;
    /** ID of the rubrique */
    rubriqueId: number;
    /** ID of the rubriquage this rubrique belongs to */
    rubriquageId?: number;
    /** Number of emissions in the rubrique */
    emissionCount?: number;
    /** Number of podcasts in the rubrique */
    podcastCount?: number;
    /** Custom properties defined on the rubrique */
    annotations?: Record<string, string|number|boolean>;
    score?: number;
    organisationPrivacy?: string;
}
