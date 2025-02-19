import {useErrorHandler} from "./useErrorHandler";
import { useFilterStore } from "../../stores/FilterStore";
import { useSaveFetchStore } from "../../stores/SaveFetchStore";
import { state } from "../../stores/ParamSdkStore";
import classicApi from "../../api/classicApi";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { useRoute, useRouter } from "vue-router";
import { AxiosError } from "axios";
export const useOrganisationFilter= ()=>{

  const {handle403} = useErrorHandler();

  const filterStore = useFilterStore();
  const saveFetchStore = useSaveFetchStore();

  const route = useRoute();
  const router = useRouter();
 
  async function  selectOrganisation(organisationId: string): Promise<void> {
    try {
      const response = await saveFetchStore.getOrgaData(organisationId);
      const data = await classicApi.fetchData<Array<Rubriquage>>({
        api: 0,
        path:"rubriquage/find/" + organisationId,
        parameters:{
          sort: "HOMEPAGEORDER",
          homePageOrder: true,
        },
        specialTreatement:true
      });
      const isLive = await saveFetchStore.getOrgaLiveEnabled(organisationId);
      filterStore.filterUpdateOrga({
        orgaId: organisationId,
        imgUrl: response.imageUrl,
        name: response.name,
        rubriquageArray: data.filter((element: Rubriquage) => {
          return element.rubriques.length;
        }),
        isLive: isLive,
      });
      if(!state.generalParameters.podcastmaker){
        const queries = route.query;
        router.push({
          query: { ...queries, ...{ productor: organisationId, o:undefined } },
        });
      }
    } catch (error) {
      handle403(error as AxiosError);
    }
  }

  function removeSelectedOrga(): void {
    if (route.query.productor) {
      router.push({
        query: { ...route.query, ...{ productor: undefined } },
      });
    }
    filterStore.filterUpdateOrga({ orgaId: undefined });
  }

	return {
    selectOrganisation,
    removeSelectedOrga
	}
}