<template>
    <section v-if="isInit" class="page-box">
        <slot name="new-emission" />
        <ProductorSearch
            v-model:organisation-id="organisationId"
            v-model:search-pattern="searchPattern"
            type="emission"
        />
        <AdvancedSearch
            v-model:monetisable="monetisable"
            v-model:iab-id="iabId"
            v-model:sort="sort"
            v-model:include-hidden="includeHidden"
            v-model:from-date="fromDate"
            v-model:to-date="toDate"
            v-model:rubrique-filter="rubriqueFilter"
            v-model:beneficiaries="beneficiaries"
            v-model:emission-groups="emissionGroups"
            :search-pattern="searchPattern"
            :is-emission="true"
            :organisation-id="organisationId"
        />
        <EmissionList
            :show-count="true"
            :first="paginateFirst"
            :size="ps"
            :query="searchMinSize"
            :organisation-id="organisationId"
            :monetisable="monetisable"
            :before="toDate"
            :after="fromDate"
            :sort="sort"
            :include-hidden="includeHidden"
            :iab-id="iabId"
            :rubrique-id="rubriquesFilterArrayIds.rubriqueId"
            :rubriquage-id="rubriquesFilterArrayIds.rubriquageId"
            :no-rubriquage-id="rubriquesFilterArrayIds.noRubriquageId"
            :beneficiaries="beneficiaries"
            :emission-groups="emissionGroups"
        />
    </section>
</template>

<script setup lang="ts">
import EmissionList from "../display/emission/EmissionList.vue";
import AdvancedSearch from "../display/filter/AdvancedSearch.vue";
import {useAdvancedParamInit} from "../composable/route/useAdvancedParamInit";
import { defineAsyncComponent } from "vue";
import { RouteProps } from "../composable/route/types";
const ProductorSearch = defineAsyncComponent(
    () => import("../display/filter/ProductorSearch.vue"),
);

//Props
const props = withDefaults(defineProps<RouteProps>(), {
    pr: 0,
    ps: 30,
    routeMonetisable: "UNDEFINED",
    routeSort: "LAST_PODCAST_DESC"
});

//Composables
const {
    organisationId,
    searchPattern,
    monetisable,
    iabId,
    sort,
    includeHidden,
    fromDate,
    toDate,
    rubriqueFilter,
    searchMinSize,
    paginateFirst,
    rubriquesFilterArrayIds,
    isInit,
    beneficiaries,
    emissionGroups
} = useAdvancedParamInit(props, true);
</script>
