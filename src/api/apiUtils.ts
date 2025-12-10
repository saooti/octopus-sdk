/**
 * Utility function to easily convert a list of IDs to a map of id => element
 * @param ID The type of ID for the element
 * @param T The type of element to retrieve
 * @param ids The list of ids
 * @param getter A function that given an ID, returns a promise of the matching element
 * @param key The key for the ID
 * @return A promise containing a map of ID => element
 */
export async function mapFromGetAll<ID extends string|number, T extends object >(ids: Array<ID>, getter: (id: ID) => Promise<T>, key: keyof T): Promise<Record<string, T>> {
    const results: Record<string, T> = {};
    const promises: Array<Promise<T>> = [];

    // Retrieve data for each id
    ids.forEach((id: ID) => {
        const promise = getter(id).then(elt => results['' + elt[key]] = elt);
        promises.push(promise);
    });

    // Wait for all promises to finish
    await Promise.all(promises);

    return results;
}

