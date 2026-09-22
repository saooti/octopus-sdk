import { rubriquesApi } from '@/api';
import { slugify } from '@/helper/slugify';
import { Annotations } from '@/stores/class/general';
import { Rubriquage } from '@/stores/class/rubrique/rubriquage';
import ParamSdkStore from '@/stores/ParamSdkStore';
import { effectScope, Ref, ref, watch } from 'vue';

const subOrganisations = ref<Array<SubOrganisation>>([]);
const selectedSubOrganisation = ref<SubOrganisation|null>(null);

// Promise for retrieving suborganisations
let loadingPromise: Promise<Rubriquage|undefined>|null = null;

// Whether the watch on organisationId has already been registered
let watchInitialized = false;

export interface SubOrganisation {
    id: number;
    name: string;
    annotations: Annotations;
    podcastCount: number;
}

function slugifySubOrganisation(subOrga: SubOrganisation): string {
    return slugify(subOrga.name);
}

/**
 * Composable to manage suborganisation.
 * Allows for selecting (= focusing), unselecting, listing, etc
 * @param organisationId ID of the current organisation
 * @param slugFunc Function to slugify the suborganisation ids
 */
export const useSubOrganisations = (organisationId: Ref<string>, slugFunc = slugifySubOrganisation) => {

    // Register the watch on organisationId only once, detached from any
    // component's lifecycle, so it isn't stopped when the first caller unmounts
    if (!watchInitialized) {
        watchInitialized = true;

        // Load suborganisations if necessary
        if (subOrganisations.value.length === 0 && !loadingPromise) {
            updateList();
        }

        effectScope(true).run(() => {
            watch(organisationId, updateList);
        });
    }

    async function updateList() {
        unselectSubOrganisation();
        loadingPromise = rubriquesApi.findRestrictiveRubriquage(organisationId.value);
        const rubriquage = await loadingPromise;
        loadingPromise = null;
        if (rubriquage) {
            subOrganisations.value = rubriquage.rubriques.map(r => ({
                id: r.rubriqueId,
                name: r.name,
                podcastCount: r.podcastCount ?? 0,
                annotations: r.annotations ?? {}
            }));
        } else {
            subOrganisations.value = [];
        }
    }

    async function getSubOrganisation(id: string|number): Promise<SubOrganisation> {
        if (loadingPromise) {
            await loadingPromise;
        }

        let findFunc;
        if (typeof id === 'string') {
            findFunc = (c: SubOrganisation) => slugFunc(c) === id;
        } else {
            findFunc = (c: SubOrganisation) => c.id === id;
        }

        const subOrga = subOrganisations.value.find(findFunc);
        if (subOrga) {
            return Promise.resolve(subOrga);
        } else {
            return Promise.reject(`Sub organisation ${id} not found`);
        }
    }

    function selectSubOrganisation(subOrganisation: SubOrganisation): void {
        if (selectedSubOrganisation.value) {
            unselectSubOrganisation();
        }

        selectedSubOrganisation.value = subOrganisation;
        // Force filtering on rubrique ID of the college
        ParamSdkStore.state.generalParameters.forceRubriqueId = [
            ParamSdkStore.state.generalParameters.forceRubriqueId ?? [],
            subOrganisation.id
        ].flat();
    }

    function unselectSubOrganisation(): void {
        // Nothing to do if no org is selected
        if (!selectedSubOrganisation.value) {
            return;
        }

        // Restore the site's base rubrique filter instead of clearing it outright
        const data = ParamSdkStore.state.generalParameters.forceRubriqueId;
        if (Array.isArray(data)) {
            const idx = data.findIndex(id => id === selectedSubOrganisation.value.id);
            if (idx >= 0) {
                data.splice(idx, 1);
            }
            ParamSdkStore.state.generalParameters.forceRubriqueId = data;
        } else {
            ParamSdkStore.state.generalParameters.forceRubriqueId = undefined;
        }
        selectedSubOrganisation.value = null;
    }

    return {
        /** Currently selected/focused suborganisation */
        selectSubOrganisation,
        /** Change the currently selected/focused suborganisation */
        selectedSubOrganisation,
        /** Remove the focus on the suborganisation */
        unselectSubOrganisation,
        /** List of available suborganisations */
        subOrganisations,
        /**
         * Get a suborganisation by its ID or sluggified name
         * @param id Either the numeric ID or the sluggified name of the orga
         * @returns A promise of the matching sub organisation
         */
        getSubOrganisation
    };
};
