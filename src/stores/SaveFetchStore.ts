
import { defineStore } from 'pinia';
import octopusApi from '@saooti/octopus-api';
import { useAuthStore } from '@/stores/AuthStore';
import {Organisation} from "@/stores/class/general/organisation";

interface SaveFetchState{
  orgaPublicAttributes: {[key:string]: {[key: string]:string|number|boolean|undefined}},
  orgaLiveEnabled: {[key:string]: boolean},
  orgaData: {[key:string]: Organisation},
}
export const useSaveFetchStore = defineStore('SaveFetchStore', {
  state: (): SaveFetchState => ({
    orgaPublicAttributes:{},
    orgaLiveEnabled:{},
    orgaData:{},
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
    },
    async getOrgaData(orgaId: string): Promise<Organisation>{
      if(this.orgaData[orgaId]){
        return this.orgaData[orgaId];
      }
      const authStore = useAuthStore();
      if(orgaId === authStore.authOrganisation.id){
        this.orgaData[orgaId] = authStore.authOrganisation;
      }else{
        this.orgaData[orgaId] = await octopusApi.fetchData<Organisation>(0, 'organisation/'+orgaId);
      }
      return this.orgaData[orgaId];
    },
    async getOrgaLiveEnabled(orgaId: string): Promise<boolean>{
      if(!orgaId.length){
        return false;
      }
      if(this.orgaLiveEnabled[orgaId]){
        return this.orgaLiveEnabled[orgaId];
      }
      this.orgaLiveEnabled[orgaId] = await octopusApi.fetchData<boolean>(0, "organisation/liveEnabled/"+orgaId);
      return this.orgaLiveEnabled[orgaId];
    }
  }
})