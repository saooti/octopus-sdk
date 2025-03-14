import { useFilterStore } from '../../../stores/FilterStore';
import { useRouteUpdateParams } from './useRouteUpdateParams';
import { computed, onMounted, Ref, ref, watch } from "vue";

export const useSimplePageParam = (props: any)=>{

  const { updateRouteParam } = useRouteUpdateParams();

  const filterStore  = useFilterStore();

  const isInit = ref(false);
  const searchPattern = ref("");
  const organisationId: Ref<string|undefined> = ref(undefined);

  const searchMinSize = computed(() => searchPattern.value.length>3 ? searchPattern.value : "");
  const paginateFirst = computed(() => {
    if(!props.pr){
      return 0;
    }
    return  Math.max((props.pr - 1 ) * props.ps, 0);
  });

  watch(searchPattern, () => {
    updateRouteParam({
      q: searchMinSize.value.length ? searchMinSize.value : undefined,
    });
  });

  onMounted(() => {
    initOrga();
    initSearchPattern();
    isInit.value = true;
  })

  function initSearchPattern(){
    searchPattern.value = props.routeQuery ?? "";
  }
  function initOrga(){
    organisationId.value = filterStore.filterOrgaId ?? props.routeOrga;
  }


	return {
    searchPattern,
    organisationId,
    searchMinSize,
    paginateFirst,
    initSearchPattern,
    initOrga,
    isInit
	}
}
