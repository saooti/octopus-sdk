import { useFilterStore } from '../../../stores/FilterStore';
import { routeParams } from "../../mixins/routeParam/routeParams";
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
export const paginateParamInit = defineComponent({
  mixins: [ routeParams],
  props: {
    pr: { default: 0, type: Number },
    ps: { default: 30, type: Number },
    routeOrga: { default: undefined, type: String },
    routeQuery: { default: "", type: String },
  },
  data() {
    return {
      organisationId: undefined as string | undefined,
      searchPattern: "" as string,
    };
  },
  computed:{
    ...mapState(useFilterStore, ["filterOrgaId"]),
    paginateFirst(){
      if(!this.pr){
        return 0;
      }
      return  Math.max((this.pr - 1 ) * this.ps, 0);
    },
    searchMinSize(): string{
      return this.searchPattern.length>3 ? this.searchPattern : "";
    },
  },
  watch: {
    searchPattern(value: string): void {
      this.updateRouteParam({
        q: this.searchMinSize.length ? this.searchMinSize : undefined,
      });
    },
  },
  created() {
    this.organisationId = this.filterOrgaId ?? this.routeOrga;
    this.searchPattern = this.routeQuery ?? "";
  },
});

