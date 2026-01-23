import { useAdvancedParamInit } from "@/components/composable/route/useAdvancedParamInit";
import { vi } from "vitest";

vi.mock("@/components/composable/route/useAdvancedParamInit", () => ({
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
    })
}));
