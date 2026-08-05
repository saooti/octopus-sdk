import { classicApi, ModuleApi } from "@saooti/octopus-sdk";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { useCacheStore } from "../stores/CacheStore";

/**
 * Find rubriquages according to criterias
 * @param organisationIds List of organisation IDs for which to retrieve the
 *                        rubriquage
 * @param searchOptions Additional search options
 */
async function searchRubriquages(organisationIds: Array<string>, searchOptions?: {
    rubriquageId?: number;
    organisationId?: string|Array<string>;
    query?: string;
}): Promise<Array<Rubriquage>> {
    return classicApi.fetchData<Array<Rubriquage>>({
        api: ModuleApi.DEFAULT,
        path: 'rubriquage/find',
        parameters: {
            organisationId: organisationIds,
            ...searchOptions
        }
    });
}

/**
 * Fetch rubriquage data by ID
 * @param rubriquageId ID of the rubriquage to fetch
 * @returns The rubriquage
 */
async function getRubriquage(rubriquageId: number): Promise<Rubriquage> {
    return classicApi.fetchData<Rubriquage>({
        api: ModuleApi.DEFAULT,
        path: `rubriquage/${rubriquageId}`
    });
}

async function searchRubriques(searchOptions?: {
    rubriquageId?: number;
    organisationId?: string|Array<string>;
    query?: string;
}): Promise<Array<Rubrique>> {
    return classicApi.fetchData<Array<Rubrique>>({
        api: ModuleApi.DEFAULT,
        path: 'rubrique/search',
        parameters: searchOptions
    });
}

/**
 * Fetch rubrique data by ID
 * @see getCachedRubrique
 * @param rubriqueId ID of the rubrique to fetch
 * @returns The rubrique
 */
async function getRubrique(rubriqueId: number): Promise<Rubrique> {
    return classicApi.fetchData<Rubrique>({
        api: ModuleApi.DEFAULT,
        path: `rubrique/${rubriqueId}`
    });
}

/**
 * Fetch rubrique data by ID
 * If the rubrique is available in the cache, return it from the cache
 * @param rubriqueId ID of the rubrique to fetch
 * @returns The rubrique
 */
async function getCachedRubrique(rubriqueId: number): Promise<Rubrique> {
    const cacheStore = useCacheStore();
    return cacheStore.getData(`rubrique-${rubriqueId}`, () => getRubrique(rubriqueId));
}

export const rubriquesApi = {
    getRubriquage,
    getRubrique,
    getCachedRubrique,
    searchRubriquages,
    searchRubriques
};
