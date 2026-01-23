import { useFilterStore } from '../../../stores/FilterStore';
import { useRouteUpdateParams } from './useRouteUpdateParams';
import { computed, onMounted, Ref, ref, watch } from "vue";

import { RouteProps, ROUTE_PARAMS } from "./types";

export const useSimplePageParam = (props: RouteProps, force=false, advancedSearch=false)=>{

  const { updateRouteParam } = useRouteUpdateParams();

  const filterStore  = useFilterStore();

  const isInit = ref(false);
  const searchPattern = ref("");
  const organisationId: Ref<string|undefined> = ref(undefined);

  const searchMinSize = computed(() => getMinSize((props.routeQuery as string)));
  const paginateFirst = computed(() => {
    if(!props.pr || props.ps === undefined) {
      return 0;
    }
    return Math.max(((props.pr as number) - 1 ) * (props.ps as number), 0);
  });

  watch(searchPattern, () => {
    if(!advancedSearch){
      const query = getMinSize(searchPattern.value);
      updateRouteParam({
        [ROUTE_PARAMS.Query]: query.length ? query : undefined,
      }, force);
    }
  });

  // When changing global organisation, update organisation here
  watch(() => filterStore.filterOrgaId, () => {
    organisationId.value = filterStore.filterOrgaId;
  });

  onMounted(() => {
    initOrga();
    initSearchPattern();
    isInit.value = true;
  });

  function getMinSize(param:string){
    return param.length>3 ?param : ""
  }
  function initSearchPattern(){
    searchPattern.value = (props.routeQuery as string) ?? "";
  }
  function initOrga(){
    organisationId.value = filterStore.filterOrgaId ?? (props.routeOrga as string);
  }


  return {
    searchPattern,
    organisationId,
    searchMinSize,
    paginateFirst,
    initSearchPattern,
    initOrga,
    updateRouteParam,
    isInit
  };
}
