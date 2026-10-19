export function mockAdvancedParamInit(overrides: Record<string, unknown> = {}) {
    return {
        useAdvancedParamInit: () => ({
            organisationId: undefined,
            searchPattern: undefined,
            monetisable: undefined,
            iabId: undefined,
            sort: undefined,
            includeHidden: undefined,
            fromDate: undefined,
            toDate: undefined,
            rubriqueFilter: undefined,
            searchMinSize: undefined,
            paginateFirst: undefined,
            validity: undefined,
            rubriquesFilterArrayIds: undefined,
            isInit: undefined,
            beneficiaries: undefined,
            emissionGroups: undefined,
            ...overrides
        })
    };
}
