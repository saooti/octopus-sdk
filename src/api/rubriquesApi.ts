import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { useCacheStore } from "@/stores/CacheStore";
import classicApi, { type APIOptions } from "./classicApi";
import { ModuleApi } from "./apiConnection";

////////////////////////////////////////////////////////////////////////////////
// Rubriquage
////////////////////////////////////////////////////////////////////////////////
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
}, options?: APIOptions): Promise<Array<Rubriquage>> {
    return classicApi.fetchData<Array<Rubriquage>>({
        api: ModuleApi.DEFAULT,
        path: 'rubriquage/find',
        parameters: {
            organisationId: organisationIds,
            ...searchOptions
        },
        specialTreatement: options?.adaptParameters
    });
}
/**
 * Create a new rubriquage
 * @param data The new rubriquage data
 * @returns The created rubriquage
 */
async function createRubriquage(data: Omit<Rubriquage, 'rubriquageId'>): Promise<Rubriquage> {
    return classicApi.postData<Rubriquage>({
        api: ModuleApi.DEFAULT,
        path: "rubriquage/",
        dataToSend: data
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

/**
 * Update the values of the rubriquage
 * @param data The new rubriquage data
 * @returns The updated rubriquage
 */
async function updateRubriquage(data: Rubriquage): Promise<Rubriquage> {
    return classicApi.putData<Rubriquage>({
        api: ModuleApi.DEFAULT,
        path: "rubriquage/",
        dataToSend: data
    });
}

/**
 * Delete a rubriquage
 * @param data Either the rubriquage to delete, or its ID
 * @returns An empty promise
 */
async function deleteRubriquage(data: Rubriquage|number): Promise<void> {
    const rubriquageId = typeof data === 'object' ?
        data.rubriquageId :
        data;
        
    await classicApi.deleteData<void>({
        api: ModuleApi.DEFAULT,
        path: "rubriquage/" + rubriquageId
    });
}

////////////////////////////////////////////////////////////////////////////////
// Rubriques
////////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////
// Scope
////////////////////////////////////////////////////////////////////////////////
/**
 * List the rubrique IDS associated to the given user
 * @param userId The ID of the user for which to retrieve this data
 * @returns The list of IDs of rubriques
 */
async function listUserScope(userId: string): Promise<Array<number>> {
    return classicApi.fetchData<Array<number>>({
        api: ModuleApi.DEFAULT,
        path: `rubrique/user/list/rubriques/${userId}`
    });
}

/**
 * Update the associated rubriques to the user
 * @param userId The ID of the user for which to change the rights scope
 * @param previousScope Previous rubrique IDs
 * @param rubriqueIds New rubrique IDs to set
 * @returns A promise
 */
async function setUserScope(userId: string, previousScope: Array<number>, rubriqueIds: Array<number>): Promise<void> {

    const associatedIds: Array<number> = [];
    const dissociatedIds: Array<number> = [];
    const promises: Array<Promise<void>> = [];

    // Create a set containing all ids, will iterare over all of them to check
    // whether to add or remove them
    const allIds = new Set<number>();
    previousScope.forEach(allIds.add, allIds);
    rubriqueIds.forEach(allIds.add, allIds);


    // Find out which IDs need to be added/remove
    allIds.forEach(id => {
        const inOld = previousScope.includes(id);
        const inNew = rubriqueIds.includes(id);

        if (inOld && !inNew) {
            dissociatedIds.push(id);
        } else if (!inOld && inNew) {
            associatedIds.push(id);
        }
    })

    // API call for adding rubriques
    if (associatedIds.length > 0) {
        promises.push(classicApi.postData({
            api: ModuleApi.DEFAULT,
            path: 'rubrique/user/associate',
            dataToSend: {
                rubriqueIds: associatedIds,
                userIds: [userId]
            }
        }));
    }

    // API call for removing rubriques
    if (dissociatedIds.length > 0) {
        promises.push(classicApi.postData({
            api: ModuleApi.DEFAULT,
            path: 'rubrique/user/dissociate',
            dataToSend: {
                rubriqueIds: dissociatedIds,
                userIds: [userId]
            }
        }));
    }

    return Promise.all(promises).then();
}

export const rubriquesApi = {
    createRubriquage,
    getRubriquage,
    getRubrique,
    getCachedRubrique,
    searchRubriquages,
    searchRubriques,
    updateRubriquage,
    deleteRubriquage,
    listUserScope,
    setUserScope
};
