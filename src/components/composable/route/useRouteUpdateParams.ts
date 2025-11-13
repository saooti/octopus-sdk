import { useRoute, useRouter } from 'vue-router';

import { RouteParams, AdvancedRouteParams } from './types';

export const useRouteUpdateParams = () => {

  const router  = useRouter();
  const route  = useRoute();

  function checkPage(): boolean{
    return ['podcasts', 'emissions', 'participants', 'playlists', 'productors', 'rubrique'].includes(route.name?.toString()??"");
  }

  function checkPageAdvanced(): boolean{
    return ['podcasts', 'emissions'].includes(route.name?.toString()??"");
  }

  function updatePaginateSize(ps:number, force = false): void{
    if(force ||checkPage()){
      router.push({query: {...route.query, ...{ps:ps, pr:1}}});
    }
  }

  function updateRouteParam(update: RouteParams, force = false): void {
    if(force || checkPage()){
      router.push({query: {...route.query, ...update}});
    }
  }

  function updateRouteParamAdvanced(update: AdvancedRouteParams): void {
    if(checkPageAdvanced()){
      router.push({query: {...route.query, ...update}});
    }
  }

  function updateFiltersParam(update: RouteParams, advancedUpdate: AdvancedRouteParams){
    if(checkPageAdvanced()) {
      router.push({query: { ...route.query, ...update, ...advancedUpdate }});
    } else {
      router.push({query: { ...route.query, ...update }});
    }
  }

  return {
    updatePaginateSize,
    updateRouteParam,
    updateRouteParamAdvanced,
    updateFiltersParam
  }
}
