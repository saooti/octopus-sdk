
import { defineStore } from 'pinia';
import octopusApi from '@saooti/octopus-api';
import { useAuthStore } from '@/stores/AuthStore';

interface SaveFetchState{
  orgaPublicAttributes: {[key:string]: {[key: string]:string|number|boolean|undefined}},
}
export const useSaveFetchStore = defineStore('SaveFetchStore', {
  state: (): SaveFetchState => ({
    orgaPublicAttributes:{}
  }),
  actions:{
    async getOrgaAttributes(orgaId: string): Promise<{ [key: string]: string | number | boolean | undefined; }>{
      if(!orgaId.length){
        return {};
      }
      if(this.orgaPublicAttributes[orgaId]){
        return this.orgaPublicAttributes[orgaId];
      }
      const authStore = useAuthStore();
      if(orgaId === authStore.authOrganisation.id && authStore.authOrganisation.attributes && Object.keys(authStore.authOrganisation.attributes).length > 1){
        this.orgaPublicAttributes[orgaId] = authStore.authOrganisation.attributes;
      }else{
        this.orgaPublicAttributes[orgaId] = await octopusApi.fetchData<{[key:string]:string}>(0, 'organisation/attributes/'+orgaId);
      }
      return this.orgaPublicAttributes[orgaId];
    }
  }
})