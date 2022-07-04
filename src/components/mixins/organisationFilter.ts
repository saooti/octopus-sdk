
import { handle403 } from '../mixins/handle403';
import { Rubriquage } from "@/store/class/rubrique/rubriquage";
import octopusApi from '@saooti/octopus-api';
import { defineComponent } from 'vue'
import { AxiosError } from 'axios';
import { Organisation } from '@/store/class/general/organisation';
export const orgaFilter = defineComponent({
  mixins: [handle403],
  methods: {
    async selectOrganisation(organisationId: string): Promise<void> {
      try {
        const response = await octopusApi.fetchData<Organisation>(0,`organisation/${organisationId}`);
        const data = await octopusApi.fetchDataWithParams<Array<Rubriquage>>(0, 'rubriquage/find/'+organisationId,{
          sort:'HOMEPAGEORDER',
          homePageOrder: true
        }, true);
        const isLive = await octopusApi.fetchData<boolean>(0, 'organisation/liveEnabled/'+organisationId);
        this.$store.commit('filterOrga', {
          orgaId: organisationId,
          imgUrl: response.imageUrl,
          rubriquageArray: data.filter((element: Rubriquage)=>{
            return element.rubriques.length;
          }),
          isLive: isLive
        });
        const queries = this.$route.query;
        this.$router.replace({ query: {...queries, ...{productor: organisationId} } });
      } catch (error) {
        this.handle403((error as AxiosError));
      }
    },
    removeSelectedOrga(): void{
      if (this.$route.query.productor) {
        this.$router.push({ query: {...this.$route.query, ...{productor: undefined} } });
      }
      this.$store.commit('filterOrga', { orgaId: undefined });
    }
  },
});
