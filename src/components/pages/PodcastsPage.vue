<template>
    <section v-if="isInit" class="page-box">
        <ProductorSearch
            v-model:organisation-id="organisationId"
            v-model:search-pattern="searchPattern"
        />
        <AdvancedSearch
            v-model:only-video="onlyVideo"
            v-model:monetisable="monetisable"
            v-model:iab-id="iabId"
            v-model:sort="sort"
            v-model:include-hidden="includeHidden"
            v-model:from-date="fromDate"
            v-model:to-date="toDate"
            v-model:validity="validity"
            v-model:rubrique-filter="rubriqueFilter"
            v-model:beneficiaries="beneficiaries"
            v-model:emission-groups="emissionGroups"
            :search-pattern="searchPattern"
            :is-emission="false"
            :organisation-id="organisationId"
        />
        <PodcastList
            :show-count="true"
            :first="paginateFirst"
            :size="ps"
            :organisation-id="orgaArray"
            :query="searchMinSize"
            :monetisable="monetisable"
            :before="toDate"
            :after="fromDate"
            :sort-criteria="sort"
            :include-hidden="includeHidden"
            :iab-id="iabId"
            :rubrique-id="rubriquesFilterArrayIds.rubriqueId"
            :rubriquage-id="rubriquesFilterArrayIds.rubriquageId"
            :no-rubriquage-id="rubriquesFilterArrayIds.noRubriquageId"
            :beneficiaries="beneficiaries"
            :with-video="withVideo"
            :validity="validity"
            :emission-groups="emissionGroups"
        />
    </section>
</template>

<script setup lang="ts">
import PodcastList from "../display/podcasts/PodcastList.vue";
import ProductorSearch from "../display/filter/ProductorSearch.vue";
import AdvancedSearch from "../display/filter/AdvancedSearch.vue";
import {useAdvancedParamInit} from "../composable/route/useAdvancedParamInit";
import { computed, ref, watch } from "vue";
import { RouteProps } from "../composable/route/types";

//Props 
const props = withDefaults(defineProps<RouteProps>(), {
    routeMonetisable: "UNDEFINED",
    routeSort: "DATE"
});

//Data 
const onlyVideo = ref(false);

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
    validity,
    rubriquesFilterArrayIds,
    isInit,
    beneficiaries,
    emissionGroups
} = useAdvancedParamInit(props, false);

//Computed
const orgaArray = computed(() => organisationId.value ? [organisationId.value] : []);
const withVideo = computed(() => false === onlyVideo.value ? undefined : true);

//Watch
watch(() => props.routeOnlyVideo, () =>{
    onlyVideo.value = "true" === props.routeOnlyVideo;
}, {immediate: true});

</script>
