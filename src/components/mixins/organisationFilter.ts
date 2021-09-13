
import { Rubriquage } from "@/store/class/rubriquage";
import Vue from "vue";
const octopusApi = require('@saooti/octopus-api');
export const orgaFilter = Vue.extend({
  methods: {
    async selectOrganisation(organisationId: string): Promise<void> {
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
    },
  },
});
