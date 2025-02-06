import { defineComponent } from 'vue';
export const routeParams = defineComponent({
  methods: {
    checkPage(): boolean{
      return ['podcasts', 'emissions', 'participants', 'playlists', 'productors', 'rubrique'].includes(this.$route.name?.toString()??"");
    },
    checkPageAdvanced(): boolean{
      return ['podcasts', 'emissions'].includes(this.$route.name?.toString()??"");
    },
    updatePaginateSize(ps:number){
      if(this.checkPage()){
        this.$router.push({query: {...this.$route.query, ...{ps:ps, pr:1}}});
      }
    },
    updateRouteParam(update: {[key:string]: string|undefined}){
      if(this.checkPage()){
        this.$router.push({query: {...this.$route.query, ...update}});
      }
    },
    updateRouteParamAdvanced(update: {[key:string]: string|undefined}){
      if(this.checkPageAdvanced()){
        this.$router.push({query: {...this.$route.query, ...update}});
      }
    },
    updateFiltersParam(update: {[key:string]: string|undefined}, advancedUpdate: {[key:string]: string|undefined}){
      if(this.checkPageAdvanced()){
        this.$router.push({query: {...this.$route.query, ...update, ...advancedUpdate}});
      }else{
        this.$router.push({query: {...this.$route.query, ...update}});
      }
    }
  },
});