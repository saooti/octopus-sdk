import { Category } from "@/stores/class/general/category";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { defineStore } from "pinia";

interface FilterState {
  filterOrgaId?: string;
  filterImgUrl?: string;
  filterName?: string;
  filterRubriquage: Array<Rubriquage>;
  filterRubrique: Array<RubriquageFilter>;
  filterRubriqueDisplay: Array<Rubrique>;
  filterTypeMedia?: string;
  filterSortOrder?: string;
  filterSortField?: string;
  filterLive?: boolean;
  filterIab?: Category;
}
export const useFilterStore = defineStore("FilterStore", {
  state: (): FilterState => ({
    filterRubriquage: [],
    filterRubrique: [],
    filterRubriqueDisplay: [],
    filterLive: false,
  }),
  actions: {
    filterUpdateOrga(filter: {
      orgaId?: string;
      imgUrl?: string;
      name?: string;
      rubriquageArray?: Array<Rubriquage>;
      isLive?: boolean;
    }) {
      this.filterOrgaId = filter.orgaId;
      if (filter.imgUrl || !filter.orgaId) {
        this.filterImgUrl = filter.imgUrl;
      }
      if (filter.name || !filter.orgaId) {
        this.filterName = filter.name;
      }
      if (filter.rubriquageArray) {
        this.filterRubriquage = filter.rubriquageArray;
      }
      this.filterLive = filter.isLive;
      this.filterIab = undefined;
    },
    filterUpdateIab(iab?: Category) {
      this.filterIab = iab;
    },
    filterUpdateRubrique(rubriqueFilter: Array<RubriquageFilter>) {
      this.filterRubrique = rubriqueFilter;
    },
    filterUpdateRubriqueDisplay(rubriques: Array<Rubrique>) {
      this.filterRubriqueDisplay = rubriques;
    },
    filterUpdateMedia(filter: {
      type?: string;
      order?: string;
      field?: string;
    }) {
      if (filter.type) {
        this.filterTypeMedia = filter.type;
      }
      if (filter.order) {
        this.filterSortOrder = filter.order;
      }
      if (filter.field) {
        this.filterSortField = filter.field;
      }
    },
  },
});
