import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { useOrgaComputed } from "../useOrgaComputed";
import { useFilterStore } from "../../../stores/FilterStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { useSimplePageParam } from './useSimplePageParam';
import { useRubriquesFilterParam } from './useRubriquesFilterParam';
import { computed, nextTick, onMounted, Ref, ref, watch } from "vue";
import dayjs from "dayjs";

export const useAdvancedParamInit = (props: any, isEmission: boolean)=>{

  const { searchPattern,organisationId, searchMinSize, paginateFirst, initSearchPattern, initOrga} = useSimplePageParam(props);
  const { isEditRights, isPodcastmaker } = useOrgaComputed();
  const { stringifyRubriquesFilter } = useRubriquesFilterParam();

  const filterStore  = useFilterStore();
  const authStore  = useAuthStore();


  const isInit = ref(false);
  const monetisable = ref("UNDEFINED");// UNDEFINED, YES, NO
  const fromDate: Ref<string|undefined> = ref(undefined);
  const toDate: Ref<string|undefined> = ref(undefined);
  const includeHidden = ref(false);
  const sort = ref("DATE"); // SCORE, DATE, POPULARITY, NAME, LAST_PODCAST_DESC
  const validity = ref("true"); 
  const iabId: Ref<number|undefined> = ref(undefined);
  const rubriqueFilter: Ref<Array<RubriquageFilter>> = ref([]);


  const organisationRight = computed(() => isEditRights(organisationId.value));
  const organisation = computed(() => organisationId.value ?? filterStore.filterOrgaId);
  const rubriquesFilterArrayIds = computed(() => {
    const allRubriquageId: Array<number> = [];
    const noRubriquageId: Array<number> = [];
    const rubriqueId: Array<number> = [];
    for(const filter of rubriqueFilter.value){
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
  });

  watch(() => props.routeQuery, () => initSearchPattern());
  watch(() => props.routeMonetisable, () => initMonetisable());
  watch(() => props.routeSort, () => initSort());
  watch(() => props.routeIncludeHidden, () => initIncludeHidden());
  watch(() => props.routeValidity, () => initValidity());
  watch(() => props.routeFrom, () => initFromDate());
  watch(() => props.routeTo, () => initToDate());
  watch(() => props.routeIab, () => {iabId.value = props.routeIab;});
  watch(() => props.routeOrga, () => initOrga());
  watch(() => props.routeRubriques, () => initRubriquageFilter());
  watch(organisationId, () => {
    if (!isInit.value) {
      return;
    }
    // TODO si oldValue !=null
    rubriqueFilter.value = [];
  });

  onMounted(() => {
    initAdvancedParams();
  })

  function initAdvancedParams(){
    iabId.value = filterStore.filterIab?.id ?? props.routeIab;
    initRubriquageFilter();
    initIncludeHidden();
    initValidity();
    initMonetisable();
    initSort();
    initFromDate();
    initToDate();
    nextTick(() => {
      isInit.value = true;
    });
  }

  function initFromDate(){
    if(dayjs(props.routeFrom).isValid()){
      fromDate.value = props.routeFrom;
    }
  }

  function initToDate(){
    if(dayjs(props.routeTo).isValid()){
      toDate.value = props.routeTo;
    }
  }

  function initMonetisable(){
    if(["YES", "NO"].includes(props.routeMonetisable)){
      monetisable.value = props.routeMonetisable;
    }else{
      monetisable.value = "UNDEFINED";
    }
  }

  function initSort(){
    if(["SCORE", "POPULARITY", "NAME", "DATE_ASC"].includes(props.routeSort)){
      sort.value = props.routeSort;
    }else{
      sort.value = isEmission ? "LAST_PODCAST_DESC" : "DATE";
    }
  }

  function initIncludeHidden(){
    includeHidden.value = undefined !== organisation.value && organisationRight.value && "false"!==props.routeIncludeHidden;
  }

  function initValidity(){
    const cantDisplay = isPodcastmaker.value || isEmission || !includeHidden.value || !authStore.isRoleContribution || !organisationRight.value;
    if(cantDisplay){
      validity.value = "true";
    }else{
      validity.value = props.routeValidity;
    }
  }

  function initRubriquageFilter(){
    if(props.routeRubriques === stringifyRubriquesFilter(rubriqueFilter.value)){
      return
    }
    const rubriqueFilterToUpdate = [];
    if(props.routeRubriques.trim().length){
      const arrayFilter = props.routeRubriques.split(",");
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
    rubriqueFilter.value = rubriqueFilterToUpdate;
  }

	return {
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
    rubriquesFilterArrayIds
	}
}
