import { Router, RouteRecordRaw, RouteRecordSingleView, RouteRecordSingleViewWithChildren } from "vue-router";
import { useFilterStore, FilterStore } from "../stores/FilterStore";
import { useSaveFetchStore } from "../stores/SaveFetchStore";
import { Rubriquage } from "../stores/class/rubrique/rubriquage";
import classicApi from "../api/classicApi";
import { useAuthStore, AuthStore } from "../stores/AuthStore";
import { deepEqual } from "../helper/equals";
import { RouteLocationNormalized } from "vue-router";
import { RouteProps } from "../components/composable/route/types";
import { ROUTE_PARAMS } from "../components/composable/route/types";
import { type Component } from "vue";

export function getSimpleRouteProps(route: RouteLocationNormalized): RouteProps {
  return {
    pr: route.query.pr ? parseInt(route.query.pr.toString(), 10) : undefined,
    ps: route.query.ps ? parseInt(route.query.ps.toString(), 10) : undefined,
    routeQuery: route.query.q as string ?? ""
  };
}

/**
 * Return route props used for filtering
 */
export function getRouteProps(route: RouteLocationNormalized): RouteProps {
  let routeEmissionGroups: number[]|undefined = undefined;
  const reg = route.query[ROUTE_PARAMS.EmissionGroups];

  if (reg !== undefined) {
    if (Array.isArray(reg)) {
      routeEmissionGroups = reg.map(g => parseInt(g, 10));
    } else {
      routeEmissionGroups = [parseInt(reg, 10)];
    }
  }
  
  return {
    ...getSimpleRouteProps(route),
    routeMonetisable: route.query.m as string ?? "",
    routeIab: route.query.i ? parseInt(route.query.i.toString(), 10) : undefined,
    routeSort: route.query.s as string ?? "",
    routeIncludeHidden: route.query.h as string ?? "",
    routeFrom: route.query.from as string|undefined,
    routeTo: route.query.to as string|undefined,
    routeOrga:route.query.o as string|undefined,
    routeRubriques :route.query.r as string ?? route.query.rubriquesId as string|undefined,
    routeBeneficiaries: route.query[ROUTE_PARAMS.Beneficiaries] as string[]|undefined,
    routeOnlyVideo: route.query.v as string|undefined ?? "",
    routeEmissionGroups
  }
}

/**
 * Utility type to use with `overwriteRoutes`.
 */
interface OverwriteRoute {
  /** Name of the route to overwrite */
  name: string;
  /** Component to overwrite with */
  component: Component;
}

/**
 * Utility function to overwrite the routes defined in the SDK
 * Overwrite the component of given routes based on their name, without
 * having to specify the path.
 * This allows for the SDK to completely manage its routes, and be able to
 * change their paths, without having to update the routes in the app using the
 * SDK.
 */
export function overwriteRoutes(routes: Array<RouteRecordSingleView| RouteRecordSingleViewWithChildren>, overwrite: Array<OverwriteRoute>): Array<RouteRecordRaw> {
  const newRoutes = [...routes];

  overwrite.forEach(overwrite => {
    // Find route by name
    const idx = newRoutes.findIndex(r => r.name === overwrite.name);
    if (idx < 0) {
      console.warn(`Could not find route '${overwrite.name}' to overwrite`);
      return;
    }

    // Overwrite component of route
    const data = newRoutes[idx];
    newRoutes[idx] = {
      ...data,
      component: overwrite.component
    }
  });
  
  return newRoutes;
}

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

// Type for loading layouts
type LayoutLoader = () => Promise<{ default: Component }>;

/**
 * Utility function to prepare a layout for a given route
 */
async function loadLayout(loader: LayoutLoader, route: RouteLocationNormalized): Promise<void> {
  try {
    const layout = await loader();
    route.meta.layoutComponent = layout.default;
  } catch (e) {
    console.error("Error occured while processing layout", e);
    const layout = await import('../layouts/SimpleLayout.vue');
    route.meta.layoutComponent = layout.default;
  }
}

let fetchMyOrgaActive = false;
/** Variable used to apply beforeEach redirect only once */
let resolved = false;

/**
 * Utility function seting up the router with a custom beforeEach
 * @param router The router to setup
 * @param getMyOrgaActive Callback to retrieve current organisation for user
 * @param defaultLayout Loader for the default layout of pages
 */
export function setupRouter(router: Router, getMyOrgaActive: (authStore: AuthStore) => Promise<void>, defaultLayout: LayoutLoader): void {
  router.beforeResolve(async () =>{
    fetchMyOrgaActive = false;
    // Reinit variable to allow one redirect
    resolved = false;
  });

  // Navigation guard that setups layout
  router.beforeEach(async(route) => {
    if (route.meta.layout) {
      await loadLayout(route.meta.layout as LayoutLoader, route);
    } else {
      await loadLayout(defaultLayout, route);
    }
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
