
import { handle403 } from '../mixins/handle403';
import { Rubriquage } from "@/store/class/rubrique/rubriquage";
import octopusApi from '@saooti/octopus-api';
import { defineComponent } from 'vue'
import { AxiosError } from 'axios';
export const orgaFilter = defineComponent({
  mixins: [handle403],
  methods: {
    async selectOrganisation(organisationId: string): Promise<void> {
      try {
        const response = await octopusApi.fetchOrganisation(organisationId);
        const data = await octopusApi.fetchTopics(organisationId, {
          sort:'HOMEPAGEORDER',
          homePageOrder: true
        });
        const isLive = await octopusApi.liveEnabledOrganisation(organisationId);
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
  },
});
