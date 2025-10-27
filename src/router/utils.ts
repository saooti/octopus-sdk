import { Router } from "vue-router";
import { useFilterStore, FilterStore } from "../stores/FilterStore";
import { useSaveFetchStore } from "../stores/SaveFetchStore";
import { Rubriquage } from "../stores/class/rubrique/rubriquage";
import classicApi from "../api/classicApi";
import { useAuthStore, AuthStore } from "../stores/AuthStore";
import { deepEqual } from "../helper/equals";

async function changeOrgaFilter(orgaFilter: string, filterStore: FilterStore){
  const saveStore = useSaveFetchStore();
  const response = await saveStore.getOrgaData(orgaFilter);
  const data = await classicApi.fetchData<Array<Rubriquage>>({
    api: 0,
    path: "rubriquage/find/" + orgaFilter,
    parameters: {
      sort: "HOMEPAGEORDER",
      homePageOrder: true,
    },
    specialTreatement: true,
  });
  const isLive = await saveStore.getOrgaLiveEnabled(orgaFilter);
  filterStore.filterUpdateOrga({
    orgaId: orgaFilter,
    imgUrl: response.imageUrl,
    name: response.name,
    rubriquageArray: data.filter((element: Rubriquage) => {
      return element.rubriques.length;
    }),
    isLive: isLive,
  });
}

let fetchMyOrgaActive = false;
/** Variable used to apply beforeEach redirect only once */
let resolved = false;

/**
 * Utility function seting up the router with a custom beforeEach
 */
export function setupRouter(router: Router, getMyOrgaActive: (authStore: AuthStore) => Promise<string>): void {
  router.beforeResolve(async () =>{
    fetchMyOrgaActive = false;
    // Reinit variable to allow one redirect
    resolved = false;
  });

  // Navigation guard that updates current organisation & may make redirects
  router.beforeEach(async (to, from) => {

    if ("/logout" === to.path && "/logout" !== from.path) {
      setTimeout(() => {
        window.location.reload(true);
      }, 500);
    }
    const authStore = useAuthStore();
    const filterStore = useFilterStore();
    
    const isSamePath = to.matched[0]?.path === from.matched[0]?.path && to.path.includes(from.path);
    let orgaToFocus = isSamePath ? (to.query.productor?.toString() ?? undefined) : undefined;

    if(authStore.authProfile){
      if(!isSamePath && !fetchMyOrgaActive){
        await getMyOrgaActive(authStore);
        fetchMyOrgaActive = true;
      }
      if(undefined!==orgaToFocus){
        orgaToFocus = authStore.authOrgaId;
      }
    }

    // Update organisation
    if (isSamePath && orgaToFocus !== from.query.productor) {
      if (filterStore.filterOrgaId !== orgaToFocus && orgaToFocus !== undefined) {
        await changeOrgaFilter(orgaToFocus, filterStore);
      }
    }

    // Only change target if not going to logout and not already resolved
    if ("/logout" !== to.path && resolved !== true) {
      resolved = true;
      const newQuery = {
        ...to.query
      };

      // Set productor
      if (to.query.productor) {
        newQuery.productor = to.query.productor;
      } else if (filterStore.filterOrgaId === undefined) {
        delete newQuery.productor;
      } else {
        newQuery.productor = filterStore.filterOrgaId;
      }

      // Enable 'viewall' mode if already active
      if ((from.query.viewall === "true" || to.query.viewall === "true") && to.query.viewall !== "false") {
        newQuery.viewall = "true";
      } else {
        delete newQuery.viewall;
      }

      // If the queries are different, update path
      if (!deepEqual(newQuery, to.query)) {
        return {
          path: to.path,
          query: { ...newQuery },
          params: to.params,
          name: to.name,
        };
      }
    }
  });
}