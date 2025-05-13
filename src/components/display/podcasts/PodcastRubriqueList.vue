<template>
  <div
    v-if="rubriqueIds.length && init"
    class="rubrique-list-component d-flex align-items-center flex-wrap mb-3 small-text"
  >
    <div class="fw-bold me-3">
      {{ $t("Rubrics") + " : " }}
    </div>
    <router-link
      v-for="rubriqueId in rubriqueIds"
      :key="rubriqueId"
      class="d-flex align-items-center border p-1 m-1 text-dark"
      :to="{
        name: 'rubrique',
        params: { rubriqueId: rubriqueId},
        query: organisationQuery
      }"
    >
      {{ rubriquagesOrga[rubriqueId]?.name ?? rubriqueId}}
    </router-link>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState } from "pinia";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import {defineComponent } from "vue";
import { Rubrique } from "../../../stores/class/rubrique/rubrique";
import { useFilterStore } from "../../../stores/FilterStore";
export default defineComponent({
  name: "TagList",
  components: {
  },
  props: {
    rubriqueIds: { default: () => [], type: Array as () => Array<number> },
    orgaId: {default: "", type: String,},
  },
  data() {
    return {
      rubriquagesOrga: {} as {[key:number]:Rubrique},
      init: false as boolean,
    };
  },

  computed:{
    ...mapState(useFilterStore, ["filterOrgaId"]),
    organisationQuery(){
      if(this.filterOrgaId){
        return undefined;
      }
      return { o: this.orgaId};
    }
  },
  created() {
    this.fetchRubriquages();
  },
  methods:{
    ...mapActions(useSaveFetchStore, ["getOrgaRubriques"]),
    async fetchRubriquages(){
      const rubriquagesOrga = await this.getOrgaRubriques(this.orgaId);
      const rubriquesArray= rubriquagesOrga.flatMap((rub) =>rub.rubriques);
      this.rubriquagesOrga= rubriquesArray.reduce((results, u)=> {results[u.rubriqueId??0] = u; return results}, {} as {[key:number]:Rubrique});
      this.init = true;
    },
  }
});
</script>
