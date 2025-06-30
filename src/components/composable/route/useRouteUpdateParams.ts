import { useRoute, useRouter } from 'vue-router';
export const useRouteUpdateParams = ()=>{

  const router  = useRouter();
  const route  = useRoute();

  function checkPage(): boolean{
    return ['podcasts', 'emissions', 'participants', 'playlists', 'productors', 'rubrique'].includes(route.name?.toString()??"");
  }

  function checkPageAdvanced(): boolean{
    return ['podcasts', 'emissions'].includes(route.name?.toString()??"");
  }

  function updatePaginateSize(ps:number, force= false){
    if(force ||checkPage()){
      router.push({query: {...route.query, ...{ps:ps, pr:1}}});
    }
  }

  function updateRouteParam(update: {[key:string]: string|undefined}, force= false){
    if(force || checkPage()){
      router.push({query: {...route.query, ...update}});
    }
  }

  function updateRouteParamAdvanced(update: {[key:string]: string|undefined}){
    if(checkPageAdvanced()){
      router.push({query: {...route.query, ...update}});
    }
  }

  function updateFiltersParam(update: {[key:string]: string|undefined}, advancedUpdate: {[key:string]: string|undefined}){
    if(checkPageAdvanced()){
      router.push({query: {...route.query, ...update, ...advancedUpdate}});
    }else{
      router.push({query: {...route.query, ...update}});
    }
  }


	return {
    updatePaginateSize,
    updateRouteParam,
    updateRouteParamAdvanced,
    updateFiltersParam
	}
}
