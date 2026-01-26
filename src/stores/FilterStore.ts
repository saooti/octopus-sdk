import { computed, ref } from 'vue';

import { Category } from '@/stores/class/general/category';
import { Rubriquage } from '@/stores/class/rubrique/rubriquage';
import { RubriquageFilter } from '@/stores/class/rubrique/rubriquageFilter';
import { Rubrique } from '@/stores/class/rubrique/rubrique';
import { defineStore } from 'pinia';
import { useAuthStore } from './AuthStore';
import { useRoute } from 'vue-router';

import { state as sdkParams } from './ParamSdkStore';

/**
 * Store managing data regarding the filters to apply to know which
 * podcasts to show.
 */
export const useFilterStore = defineStore("FilterStore", () => {
  const _filterOrgaId = ref<string|null>(null);
  const filterImgUrl = ref<string>();
  const filterName = ref<string>();
  const filterRubriquage = ref<Array<Rubriquage>>([]);
  const filterRubrique = ref<Array<RubriquageFilter>>([]);
  const filterRubriqueDisplay = ref<Array<Rubrique>>([]);
  const filterTypeMedia = ref<string>();
  const filterSortOrder = ref<string>();
  const filterSortField = ref<string>();
  const filterLive = ref<boolean>(false);
  const filterIab = ref<Category>();

  const route = useRoute();
  const authStore = useAuthStore();

  /**
   * ID of the current organisation.
   */
  const filterOrgaId = computed((): string|undefined => {
    // When explicitly asking to view all content, disable filter
    if (route?.query.viewall === "true") {
      return undefined;

    // When productor set in route, use it
    } else if (route?.query.productor) {
      return route.query.productor as string;

    // If we don´t have an ID stored, use data from auth store
    } else if(_filterOrgaId.value === null) {
      return authStore.authOrgaId;

    // Otherwise use stored ID
    } else {
      return _filterOrgaId.value ?? undefined;
    }
  });

  /** Update stored organisation ID only if not already set */
  function updateOrgaIfNecessary(orgaId: string|undefined): void {
    if (orgaId && filterOrgaId.value === undefined && sdkParams.generalParameters.podcastmaker !== true) {
      _filterOrgaId.value = orgaId;
    }
  }

  /**
   * The ID of the current organisation, regardless of other options.
   * Use this if you want to know the organisation of the user even in
   * unfocused mode (ie viewall = true)
   */
  const realOrgaId = computed(() => {
    return _filterOrgaId.value ?? undefined;
  });

  function filterUpdateOrga(filter: {
    orgaId?: string;
    imgUrl?: string;
    name?: string;
    rubriquageArray?: Array<Rubriquage>;
    isLive?: boolean;
  }) {
    if (filter.imgUrl || !filter.orgaId) {
      filterImgUrl.value = filter.imgUrl;
    }
    if (filter.name || !filter.orgaId) {
      filterName.value = filter.name;
    }
    if (filter.rubriquageArray) {
      filterRubriquage.value = filter.rubriquageArray;
    }
    filterLive.value = filter.isLive ?? false;
    filterIab.value = undefined;
    _filterOrgaId.value = filter.orgaId ?? null;
  }

  function filterUpdateIab(iab?: Category) {
    filterIab.value = iab;
  }

  function filterUpdateRubrique(rubriqueFilter: Array<RubriquageFilter>) {
    filterRubrique.value = rubriqueFilter;
  }

  function filterUpdateRubriqueDisplay(rubriques: Array<Rubrique>) {
    filterRubriqueDisplay.value = rubriques.filter(rubrique=> rubrique);
  }

  function filterUpdateMedia(filter: {
    type?: string;
    order?: string;
    field?: string;
  }) {
    if (filter.type) {
      filterTypeMedia.value = filter.type;
    }
    if (filter.order) {
      filterSortOrder.value = filter.order;
    }
    if (filter.field) {
      filterSortField.value = filter.field;
    }
  }

  return {
    filterOrgaId,
    realOrgaId,

    updateOrgaIfNecessary,
    
    filterUpdateOrga,
    filterUpdateIab,
    filterUpdateRubrique,
    filterUpdateRubriqueDisplay,
    filterUpdateMedia,

    filterImgUrl,
    filterName,
    filterRubriquage,
    filterRubrique,
    filterRubriqueDisplay,
    filterTypeMedia,
    filterSortOrder,
    filterSortField,
    filterLive,
    filterIab
  };
});

/** Type for the FilterStore */
export type FilterStore = ReturnType<typeof useFilterStore>;
