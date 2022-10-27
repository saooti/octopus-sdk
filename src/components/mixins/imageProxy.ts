import { state } from '../../store/paramStore';
export default {
  methods: {
    proxyImageUrl(url:string, width:string, height?:string): string{
      if(!url){
        return "";
      }
      if(state.octopusApi.imageUrl && url.includes('http')){
        const size = height ? "height="+height:"width="+width;
        return state.octopusApi.imageUrl+"image/"+btoa(url)+"?"+size+"&useWebp=true";
      }
      return url;
    },
  },
};