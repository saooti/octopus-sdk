<template>
    <div id="advanced-search" class="d-flex flex-column justify-content-center align-items-center">
        <!-- Button to open the advanced filters -->
        <button
            class="d-flex justify-content-center align-items-center mb-3 text-secondary btn-transparent"
            @click="clickShowFilters"
        >
            <div>{{ t("Advanced filters") }}</div>
            <ChevronDownIcon :class="{ 'arrow-transform': showFilters }" />
        </button>

        <!-- Filters -->
        <Transition name="advanced-search">
            <div
                v-if="firstLoaded"
                v-show="showFilters"
                class="advanced-search-container"
            >
                <fieldset class="d-flex flex-column flex-grow-3">
                    <legend class="text-primary mb-2">
                        {{ t("Filter") }}
                    </legend>
                    <MonetizableFilter
                        v-if="!isPodcastmaker && !generalStore.platformEducation"
                        :is-emission="isEmission"
                        :monetisable="monetisable"
                        @update:monetisable="updateMonetisable"
                    />
                    <CategorySearchFilter :iab-id="iabId" @update:iab-id="updateIab" />
                    <RubriqueFilter
                        :rubrique-filter="rubriqueFilter"
                        @update:rubrique-filter="updateRubriquageFilter"
                    />

                    <!-- Group filters -->
                    <div v-if="!isEmission && showEmissionGroups" class="mt-3 d-flex">
                        <ClassicCheckbox
                            v-model:text-init="emissionGroupCheckbox"
                            class="flex-shrink-0"
                            id-checkbox="search-emission-groups-checkbox"
                            :label="t('Filters - Emission groups')"
                        />

                        <EmissionGroupChooser
                            v-if="emissionGroupCheckbox"
                            class="ms-4 flex-grow-1"
                            :groups="emissionGroups"
                            @update:groups="updateEmissionGroupFilter"
                        />
                    </div>

                    <!-- Date -->
                    <DateFilter
                        :is-emission="isEmission"
                        :from-date="fromDate"
                        :to-date="toDate"
                        @update-dates="updateDates($event)"
                    />

                    <!-- Rights holders/beneficiaries -->
                    <div v-if="beneficiariesEnabled" class="mt-3 d-flex">
                        <ClassicCheckbox
                            :text-init="beneficiaries !== null && beneficiaries !== undefined"
                            class="flex-shrink-0"
                            id-checkbox="search-beneficiaries-checkbox"
                            :label="t('Filters - Beneficiaries')"
                            @update:text-init="updateBeneficiariesCheckbox"
                        />

                        <ClassicTagInput
                            v-if="beneficiaries !== null && beneficiaries !== undefined"
                            class="ms-4 flex-grow-1"
                            :tags="beneficiaries"
                            @update:tags="updateBeneficiaries"
                        />
                    </div>

                    <div
                        v-if="organisation && organisationRight && !isPodcastmaker"
                        class="d-flex flex-column mt-3"
                    >
                        <ClassicCheckbox
                            :text-init="includeHidden"
                            class="flex-shrink-0"
                            id-checkbox="search-future-checkbox"
                            :label="textNotVisible"
                            :is-disabled="isSelectValidity && 'true'!==validity"
                            @update:text-init="updateIncludeHidden"
                        />
                    </div>

                    <ClassicSelect
                        v-if="isSelectValidity"
                        :text-init="validity"
                        id-select="valid-episodes-select"
                        :label="t('Episodes to validate')+' :'"
                        :display-label="true"
                        class-label="flex-shrink-0 me-1"
                        class="d-flex align-items-center mt-3 mb-0"
                        :options="[
                            { title: t('Display only episodes to validate'), value: 'false' },
                            { title: t('Display episodes to validate'), value: '' },
                            { title: t('Do not display episodes to validate'), value: 'true' },
                        ]"
                        @update:text-init="updateValidity"
                    />

                    <!-- Only with video -->
                    <ClassicCheckbox
                        v-if="!isEmission"
                        :text-init="onlyVideo"
                        class="flex-shrink-0 mt-3"
                        id-checkbox="only-video-checkbox"
                        :label="t('Show only episodes with video')"
                        @update:text-init="updateOnlyVideo"
                    />
                </fieldset>

                <!-- Sort -->
                <SearchOrder
                    :is-emission="isEmission"
                    :sort="sort"
                    @update:sort="updateSort"
                />
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";
import {useOrgaComputed} from "../../composable/useOrgaComputed";
import { useAuthStore } from "../../../stores/AuthStore";
import { useFilterStore } from "../../../stores/FilterStore";
import { useRubriquesFilterParam } from "../../composable/route/useRubriquesFilterParam";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { defineAsyncComponent, ref, computed, watch, onMounted } from "vue";
import { useGeneralStore } from "../../../stores/GeneralStore";
import { useI18n } from "vue-i18n";
const MonetizableFilter = defineAsyncComponent(
    () => import("./MonetizableFilter.vue"),
);
const CategorySearchFilter = defineAsyncComponent(
    () => import("./CategorySearchFilter.vue"),
);
const RubriqueFilter = defineAsyncComponent(
    () => import("./RubriqueFilter.vue"),
);
const ClassicSelect = defineAsyncComponent(
    () => import("../../form/ClassicSelect.vue"),
);
const ClassicTagInput = defineAsyncComponent(
    () => import("../../form/ClassicTagInput.vue"),
);
const ClassicCheckbox = defineAsyncComponent(
    () => import("../../form/ClassicCheckbox.vue"),
);
const DateFilter = defineAsyncComponent(() => import("./DateFilter.vue"));
const SearchOrder = defineAsyncComponent(() => import("./SearchOrder.vue"));
import { ROUTE_PARAMS } from '../../composable/route/types';
import { EmissionGroup, groupsApi } from "../../../api/groupsApi";
import EmissionGroupChooser from "../emission/EmissionGroupChooser.vue";
import { computedAsync } from "@vueuse/core";

//Props 
const props = withDefaults(defineProps<{
    organisationId?: string;
    /** Indicates that the filters apply to emissions */
    isEmission?: boolean;
    includeHidden?: boolean;
    sort?: string;
    onlyVideo?: boolean;
    monetisable?: string;
    iabId?: number;
    searchPattern?: string;
    fromDate?: string;
    toDate?: string;
    validity?: string;
    /** The filter on beneficiaries */
    beneficiaries?: Array<string>;
    rubriqueFilter?: Array<RubriquageFilter>;
    /** The filter on groups */
    emissionGroups?: Array<EmissionGroup>;
}>(), {
    sort: "DATE",
    monetisable: "UNDEFINED",
    searchPattern: "",
    validity: "true"
});

//Emits
const emit = defineEmits([
    "update:toDate",
    "update:fromDate",
    "update:monetisable",
    "update:iabId",
    "update:sort",
    "update:includeHidden",
    "update:validity",
    "update:rubriqueFilter",
    "update:onlyVideo",
    "update:beneficiaries",
    "update:emission-groups"
]);

//Data 
const showFilters = ref(false);
const firstLoaded = ref(false);
const showEmissionGroups = ref(false);

//Composables
const { t } = useI18n();
const { isPodcastmaker, isEditRights } = useOrgaComputed();
const { stringifyRubriquesFilter,updateRouteParamAdvanced } = useRubriquesFilterParam();
const generalStore = useGeneralStore();
const filterStore = useFilterStore();
const authStore = useAuthStore();

onMounted(async() => {
    // Only show emission groups if there are some
    const nbGroups = await groupsApi.count({
        organisationIds: [props.organisationId]
    });
    showEmissionGroups.value = nbGroups > 0;
});

//Computed
const organisationRight = computed(() => isEditRights(props.organisationId));
const organisation = computed(() => props.organisationId ?? filterStore.filterOrgaId);
const textNotVisible = computed(() => props.isEmission ? t("Consider podcasts no visible"): t("See podcasts no visible"));
const isSelectValidity = computed(() => {
    return (
        undefined !== organisation.value &&
        organisationRight.value &&
        authStore.isRoleContribution &&
        !isPodcastmaker &&
        !props.isEmission &&
        props.includeHidden
    );
});

/** The beneficiaries filter is only displayed if beneficiaries are enabled */
const beneficiariesEnabled = computed(() => {
    return authStore.authOrganisation.attributes['beneficiaries.enabled'] === 'true';
});

//Watch
watch(organisation, async () => {
    const hidden = undefined !== organisation.value && organisationRight.value && !props.isEmission;
    if (hidden !== props.includeHidden) {
        updateIncludeHidden(hidden);
    }
});

watch(()=>props.searchPattern, (value: string) => {
    const search = value.trim();
    let valSort = "SCORE"
    if(search.length <= 3){
        valSort = props.isEmission? "LAST_PODCAST_DESC" : "DATE";
    }
    updateRouteParamAdvanced({
        q: search.length ? search : undefined,
        s: valSort,
    });
});

//Methods
function updateMonetisable(value: string): void {
    emit("update:monetisable", value);
    updateRouteParamAdvanced({ m: "UNDEFINED" !== value ? value : undefined });
}

function updateIab(value: number | undefined) {
    emit("update:iabId", 0 !== value ? value : undefined);
    let filterIab = {};
    if (filterStore.filterIab && filterStore.filterIab.id !== value) {
        filterIab = { iabId: undefined };
    }
    updateRouteParamAdvanced({
        ...{ i: value ? value.toString() : undefined },
        ...filterIab,
    });
}

function updateSort(value: string) {
    emit("update:sort", value);
    updateRouteParamAdvanced({ s: value });
}

function updateIncludeHidden(value: boolean) {
    emit("update:includeHidden", value);
    updateRouteParamAdvanced({ h: value.toString() });
}

function updateValidity(value: boolean) {
    emit("update:validity", value);
    updateRouteParamAdvanced({ vl: value.toString() });
}

function updateOnlyVideo(value: boolean) {
    emit("update:onlyVideo", value);
    updateRouteParamAdvanced({ v: value ? "true" : undefined });
}

function updateDates(value: {
    from: string | undefined;
    to: string | undefined;
}): void {
    emit("update:fromDate", value.from);
    emit("update:toDate", value.to);
    updateRouteParamAdvanced({ from: value.from, to: value.to });
}

function updateRubriquageFilter(value: Array<RubriquageFilter>) {
    emit("update:rubriqueFilter", value);
    let filterRubriques = {};
    const valueString = stringifyRubriquesFilter(value);
    if (
        filterStore.filterRubrique.length &&
        stringifyRubriquesFilter(filterStore.filterRubrique) !== valueString
    ) {
        filterRubriques = { rubriquesId: undefined };
    }
    updateRouteParamAdvanced({
         r: valueString.length ? valueString : undefined,
        ...filterRubriques,
    });
}

/** Manage the checkbox enabling filtering on groups */
const emissionGroupCheckbox = computed({
    get(): boolean {
        return props.emissionGroups !== undefined && props.emissionGroups !== null;
    },
    set(value: boolean): void {
        if (value) {
            updateEmissionGroupFilter([]);
        } else {
            updateEmissionGroupFilter(undefined);
        }
    }
});

/** Update selected groups */
function updateEmissionGroupFilter(groups: Array<EmissionGroup>|undefined): void {
    if (groups !== undefined && groups.length === 0) {
        emit('update:emission-groups', []);
    } else {
        updateRouteParamAdvanced({
            [ROUTE_PARAMS.EmissionGroups]: groups?.map(g => g.groupId)
        });
        emit('update:emission-groups', groups);
    }
}

/** Update the beneficiaries filter */
function updateBeneficiaries(value: string[]|undefined): void {
    emit('update:beneficiaries', value);
    if (value === undefined) {
        updateRouteParamAdvanced({ [ROUTE_PARAMS.Beneficiaries]: undefined });
    } else {
        updateRouteParamAdvanced({ [ROUTE_PARAMS.Beneficiaries]: value });
    }
}

/** Update the value of the beneficiaries checkbox */
function updateBeneficiariesCheckbox(value: boolean): void {
    if (value === true) {
        emit('update:beneficiaries', []);
    } else {
        updateBeneficiaries(undefined);
    }
}

function clickShowFilters(): void {
    if (!firstLoaded.value) {
        firstLoaded.value = true;
    }
    showFilters.value = !showFilters.value;
}
</script>

<style lang="scss">
.octopus-app {
  .advanced-search-container {
    background: var(--octopus-background);
    display: flex;
    width: 100%;
    padding-bottom: 1rem;
    justify-content: space-around;

    @media (width <= 720px) {
      flex-wrap: wrap;
    }
  }

  .advanced-search-enter-active,
  .advanced-search-leave-active {
    transition: 0.3s all;
    opacity: 1;
    max-height: 900px;
    height: auto;
    overflow: hidden;
  }

  .advanced-search-enter-from,
  .advanced-search-leave-to {
      opacity: 0;
      max-height: 0;
      overflow: hidden;
  }
}
</style>
