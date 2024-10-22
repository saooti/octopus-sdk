import {getApiUrl, ModuleApi} from "./apiConnection";
import fetchHelper from "../helper/fetch";
import axios from 'axios';
import { FetchParam } from "@/stores/class/general/fetchParam";
import { state } from "../stores/ParamSdkStore";

interface RequestParameters{
  api: ModuleApi,
  path: string,
  isNotAuth?:boolean,
  parameters?:FetchParam,
  headers?:{[key: string]: string},
  forceRefresh?: boolean,
  specialTreatement?: boolean,
  dataToSend?: unknown,
  contentType?: string,
  noContentType?:boolean,
  catchFunction?: () => void,
}

export default {
  async fetchData<Type>(params:RequestParameters): Promise<Type> {
    let paramsString = "";
    if(params.parameters){
      if(params.specialTreatement){
        params.parameters = this.adjustParameters(params);
      }
      const parameters = fetchHelper.getUriSearchParams(params.parameters).toString();
      paramsString = parameters.length ? '?' + parameters : '';
    }
    let authHeaders = {};
    if(!params.isNotAuth){
      authHeaders = await fetchHelper.createAuthenticatedFetchHeader(params.forceRefresh);
    }
    const url = getApiUrl(params.api) + params.path +paramsString;
    const response = await axios.get(url, {headers:  {...params.headers, ...authHeaders}});
    return response.data;
  },

  async postData<Type>(params: RequestParameters): Promise<Type> {
    let paramsString = "";
    if(params.parameters){
      const parameters = fetchHelper.getUriSearchParams(params.parameters).toString();
      paramsString = parameters.length ? '?' + parameters : '';
    }
    const url = getApiUrl(params.api) + params.path + paramsString;
    let authHeaders = {};
    if(!params.isNotAuth){
      authHeaders = await fetchHelper.createAuthenticatedFetchHeader(params.forceRefresh);
    }
    let typeHeader = {};
    let dataToSend: any;
    if('formData'===params.contentType){
      typeHeader = { "Content-Type": "multipart/form-data; charset=utf-8" };
      dataToSend = new FormData();
      for (const key in params.dataToSend) {
        const value = params.dataToSend[key];
        if (undefined !== value) {
          dataToSend.append(key, value);
        }
      }
    }else if ('text'===params.contentType){
      typeHeader = { "Content-Type": "text/plain" };
      dataToSend = (params.dataToSend as string);
    }else if('urlencoded' === params.contentType){
      typeHeader = { "Content-Type": "  application/x-www-form-urlencoded" };
      dataToSend = params.dataToSend;
    }else if(params.dataToSend){
      typeHeader = { "Content-Type": 'application/json; charset=utf-8' };
      dataToSend =JSON.stringify(params.dataToSend);
    }
    if(params.noContentType){
      typeHeader = {};
    }
    const response = await axios.post(url,dataToSend,{headers:{...params.headers, ...typeHeader, ...authHeaders} }).catch((error) => {
      if(params.catchFunction){
        params.catchFunction();
      }else{
        return Promise.reject(error);
      }
    });
    return response?.data;
  },

  async putData<Type>(params: RequestParameters): Promise<Type> {
    let paramsString = "";
    if(params.parameters){
      const parameters = fetchHelper.getUriSearchParams(params.parameters).toString();
      paramsString = parameters.length ? '?' + parameters : '';
    }
    const url = getApiUrl(params.api) + params.path + paramsString;
    let authHeaders = {};
    if(!params.isNotAuth){
      authHeaders = await fetchHelper.createAuthenticatedFetchHeader(params.forceRefresh);
    }
    let typeHeader = {};
    let dataToSend: any;
    if('formData'===params.contentType){
      typeHeader = { "Content-Type": "multipart/form-data; charset=utf-8" };
      dataToSend = new FormData();
      for (const key in params.dataToSend) {
        const value = params.dataToSend[key];
        if (undefined !== value) {
          dataToSend.append(key, value);
        }
      }
    }else if(params.dataToSend){
      typeHeader = { "Content-Type": 'application/json; charset=utf-8' };
      dataToSend = JSON.stringify(params.dataToSend);
    }
    if(params.noContentType){
      typeHeader = {};
    }
    const response = await axios.put(url,dataToSend,{headers:{...params.headers, ...typeHeader, ...authHeaders} });
    return response.data;
  },

  async deleteData<Type>(params: RequestParameters):Promise<Type> {
    let paramsString = "";
    if(params.parameters){
      const parameters = fetchHelper.getUriSearchParams(params.parameters).toString();
      paramsString = parameters.length ? '?' + parameters : '';
    }
    const url = getApiUrl(params.api) + params.path + paramsString;
    let authHeaders = {};
    if(!params.isNotAuth){
      authHeaders = await fetchHelper.createAuthenticatedFetchHeader(params.forceRefresh);
    }
    let dataToSend: any;
    if('formData'===params.contentType){
      dataToSend = new FormData();
      for (const key in params.dataToSend) {
        const value = params.dataToSend[key];
        if (undefined !== value) {
          dataToSend.append(key, value);
        }
      }
    }else{
      dataToSend = params.dataToSend;
    }
    const response = await axios.delete(url, {headers:{...params.headers, ...authHeaders},  data: dataToSend });
    return response.data;
  },

  adjustParameters(params:RequestParameters){
    let parametersUpdated = params.parameters ?? {};
    if (params.path.includes('podcast/search')){
      if(!params.parameters?.includeHidden || params.isNotAuth){
        parametersUpdated.validity = true;
      }else{
        parametersUpdated.includeStatus = ['READY', 'PLANNED', 'PROCESSING', 'ERROR'];
        if (!parametersUpdated.notLive) {
          parametersUpdated.includeStatus.push('READY_TO_RECORD');
        }
      }
    }
    if(state.generalParameters.forceOrganisationId){
      if(!parametersUpdated.organisationId || !(parametersUpdated.organisationId as Array<string>)?.length){
        parametersUpdated.organisationId = state.generalParameters.forceOrganisationId;
      }else if(Array.isArray(parametersUpdated.organisationId)&& 1===(parametersUpdated.organisationId as Array<string>).length && ""===parametersUpdated.organisationId[0]){
        parametersUpdated.organisationId = undefined;
      }
    }
    return parametersUpdated
  },
}