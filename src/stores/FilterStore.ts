import { computed, ref } from 'vue';

import { Category } from '@/stores/class/general/category';
import { Rubriquage } from '@/stores/class/rubrique/rubriquage';
import { RubriquageFilter } from '@/stores/class/rubrique/rubriquageFilter';
import { Rubrique } from '@/stores/class/rubrique/rubrique';
import { defineStore } from 'pinia';
import { useAuthStore } from './AuthStore';
import { useRoute } from 'vue-router';

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
  const filterOrgaId = computed(() => {
    if (route?.query.displayAll === "true") {
      return undefined;
    } else if (route?.query.productor) {
      return route.query.productor;
    } else if(_filterOrgaId.value === null) {
      return authStore.authOrgaId;
    } else {
      return _filterOrgaId.value ?? undefined;
    }
  });

  /**
   * The ID of the current organisation, regardless of other options.
   * Use this if you want to know the organisation of the user even in
   * unfocused mode (ie displayAll = true)
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