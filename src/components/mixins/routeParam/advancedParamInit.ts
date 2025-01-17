import { useFilterStore } from "../../../stores/FilterStore";
import { orgaComputed } from "../orgaComputed";
import { paginateParamInit } from "./paginateParamInit";
import { rubriquesFilterParam } from "./rubriquesFilterParam";
import { defineComponent } from 'vue';
import { mapState } from "pinia";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import dayjs from "dayjs";
export const advancedParamInit = defineComponent({
  mixins: [orgaComputed, paginateParamInit, rubriquesFilterParam],
  props: {
    productor: { default: undefined, type: String },
    routeQuery: { default: "", type: String },
    routeMonetisable: { default: "UNDEFINED", type: String },
    routeIab: { default: undefined, type: Number },
    routeSort: { default: "DATE", type: String },
    routeIncludeHidden: { default: "", type: String },
    routeFrom: { default: undefined, type: String },
    routeTo: { default: undefined, type: String },
    routeOrga: { default: undefined, type: String },
    routeRubriques: { default: "", type: String },
  },
  data() {
    return {
      isInit: false as boolean,
      searchPattern: "" as string,
      organisationId: undefined as string | undefined,
      monetisable: "UNDEFINED" as string, // UNDEFINED, YES, NO
      fromDate: undefined as string | undefined,
      toDate: undefined as string | undefined,
      includeHidden: false as boolean,
      sort: "DATE" as string, // SCORE, DATE, POPULARITY, NAME, LAST_PODCAST_DESC
      notValid: false as boolean,
      iabId: undefined as number | undefined,
      noRubriquageId: [] as Array<number>,
      rubriquageId: [] as Array<number>,
      rubriqueId: [] as Array<number>,
      isEmission: false as boolean,
      rubriqueFilter:[] as Array<RubriquageFilter>,
    };
  },
  computed:{
    ...mapState(useFilterStore, ["filterRubrique", "filterIab"]),
    organisationRight(): boolean {
      return this.isEditRights(this.organisationId);
    },
    organisation(): string | undefined {
      return this.organisationId ? this.organisationId : this.filterOrgaId;
    },
    searchMinSize(): string{
      return this.searchPattern.length>3 ? this.searchPattern : "";
    },
    rubriquesFilterArrayIds(){
      const allRubriquageId: Array<number> = [];
      const noRubriquageId: Array<number> = [];
      const rubriqueId: Array<number> = [];
      for(const filter of this.rubriqueFilter){
        if (-1 === filter.rubriqueId) {
          noRubriquageId.push(filter.rubriquageId);
        } else if (0 === filter.rubriqueId) {
          allRubriquageId.push(filter.rubriquageId);
        } else {
          rubriqueId.push(filter.rubriqueId);
        }
      }
      return {
        rubriquageId: allRubriquageId,
        rubriqueId: rubriqueId,
        noRubriquageId: noRubriquageId
      }

    }
  },
  watch: {
    organisationId(): void {
      if (!this.isInit) {
        return;
      }
      // TODO si oldValue !=null
      this.rubriqueFilter = [];
    },
    routeQuery(){
      this.initSearchPattern();
    },
    routeMonetisable(){
      this.initMonetisable();
    },
    routeSort(){
      this.initSort();
    },
    routeIncludeHidden(){
      this.initIncludeHidden();
    },
    routeFrom(){
      this.initFromDate();
    },
    routeTo(){
      this.initToDate();
    },
    routeIab(){
      this.iabId = this.routeIab;
    },
    routeOrga(){
      this.initOrga();
    },
    routeRubriques(){
      this.initRubriquageFilter();
    },

  },
  created() {
    this.initAdvancedParams();
  },
  methods:{
    initAdvancedParams(){
      this.initOrga();
      this.initSearchPattern(); 
      this.iabId = this.filterIab?.id ?? this.routeIab;
      this.initRubriquageFilter();
      this.initIncludeHidden();
      this.initMonetisable();
      this.initSort();
      this.initFromDate();
      this.initToDate();
      this.$nextTick(() => {
        this.isInit = true;
      });
    },
    initOrga(){
      this.organisationId = this.filterOrgaId ?? this.routeOrga;
    },
    initFromDate(){
      if(dayjs(this.routeFrom).isValid()){
        this.fromDate = this.routeFrom;
      }
    },
    initToDate(){
      if(dayjs(this.routeTo).isValid()){
        this.toDate = this.routeTo;
      }
    },
    initSearchPattern(){
      if(this.routeQuery){
        this.searchPattern = this.routeQuery;
      }else{
        this.searchPattern = "";
      }
    },
    initMonetisable(){
      if(["YES", "NO"].includes(this.routeMonetisable)){
        this.monetisable = this.routeMonetisable;
      }else{
        this.monetisable = "UNDEFINED";
      }
    },
    initSort(){
      if(["SCORE", "POPULARITY", "NAME", "DATE_ASC"].includes(this.routeSort)){
        this.sort = this.routeSort;
      }else{
        this.sort = this.isEmission ? "LAST_PODCAST_DESC" : "DATE";
      }
    },
    initIncludeHidden(){
      this.includeHidden = undefined !== this.organisation && this.organisationRight && "false"!==this.routeIncludeHidden;
    },
    initRubriquageFilter(){
      if(this.routeRubriques === this.stringifyRubriquesFilter(this.rubriqueFilter)){
        return
      }
      const rubriqueFilterToUpdate = [];
      if(this.routeRubriques.trim().length){
        const arrayFilter = this.routeRubriques.split(",");
        for(const filter of arrayFilter){
          const rubriqueFilter = filter.split(":");
          rubriqueFilterToUpdate.push({
            rubriquageId:  parseInt(rubriqueFilter[0]),
            rubriqueId:  parseInt(rubriqueFilter[1]),
            nameRubriquage: "",
            nameRubrique: "",
          })
        }
      }
      this.rubriqueFilter = rubriqueFilterToUpdate;
    },
  }
});

