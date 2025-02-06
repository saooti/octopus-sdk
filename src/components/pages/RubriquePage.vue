<template>
  <section class="page-box">
    <h1>{{ title }}</h1>
    <ProductorSearch
      v-model:organisation-id="organisationId"
      v-model:search-pattern="searchPattern"
    />
    <PodcastList
      :first="paginateFirst"
      :size="ps"
      :rubrique-id="[rubriqueId]"
      :organisation-id="orgaArray"
      :query="searchMinSize"
      :sort-criteria="sortOrder ?? 'DATE'"
    />
  </section>
</template>

<script lang="ts">
import { paginateParamInit } from "../mixins/routeParam/paginateParamInit";
import { seoTitleUrl } from "../mixins/seoTitleUrl";
import classicApi from "../../api/classicApi";
import PodcastList from "../display/podcasts/PodcastList.vue";
import { defineAsyncComponent, defineComponent } from "vue";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { useGeneralStore } from "../../stores/GeneralStore";
import { mapState } from "pinia";
const ProductorSearch = defineAsyncComponent(
  () => import("../display/filter/ProductorSearch.vue"),
);
export default defineComponent({
  name: "RubriquePage",
  components: {
    PodcastList,
    ProductorSearch
  },
  mixins: [paginateParamInit, seoTitleUrl],
  props: {
    pr: { default: 0, type: Number },
    ps: { default: 30, type: Number },
    rubriqueId: { default: undefined, type: Number },
    routeOrga: { default: undefined, type: String },
    routeQuery: { default: "", type: String },
  },
  data() {
    return {
      title: "" as string,
      organisationId: undefined as string | undefined,
      searchPattern: "" as string,
    };
  },
  computed:{
    ...mapState(useGeneralStore, ["metaTitle"]),
    orgaArray(): Array<string> {
      return this.organisationId ? [this.organisationId] : [];
    },
    sortOrder(){
      if(this.searchMinSize.length){
        return "SCORE";
      }
      return undefined;
    }
  },
  watch: {
    rubriqueId: {
      immediate: true,
      async handler() {
        const data = await classicApi.fetchData<Rubrique>({
          api: 0,
          path: "rubrique/" + this.rubriqueId,
        });
        this.updatePathParams(data.name);
        this.title = data.name;
      },
    },
  },
});
</script>
