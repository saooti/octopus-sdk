<template>
  <section v-if="isInit" class="page-box">
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

<script setup lang="ts">
import { useSimplePageParam } from "../composable/route/useSimplePageParam";
import {useSeoTitleUrl} from "../composable/route/useSeoTitleUrl";
import classicApi from "../../api/classicApi";
import PodcastList from "../display/podcasts/PodcastList.vue";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
const ProductorSearch = defineAsyncComponent(
  () => import("../display/filter/ProductorSearch.vue"),
);

const props = defineProps({
  pr: { default: 0, type: Number },
  ps: { default: 30, type: Number },
  rubriqueId: { default: undefined, type: Number },
  routeOrga: { default: undefined, type: String },
  routeQuery: { default: "", type: String },
});

const {
  searchPattern,
  organisationId,
  searchMinSize,
  paginateFirst,
  isInit
} = useSimplePageParam(props);

const { updatePathParams } = useSeoTitleUrl();

const title = ref("");

const orgaArray = computed(() =>organisationId.value ? [organisationId.value] : []);
const sortOrder = computed(() =>{
  if(searchMinSize.value.length){
    return "SCORE";
  }
  return undefined;
});


watch(()=>props.rubriqueId, async () => {
  const data = await classicApi.fetchData<Rubrique>({
    api: 0,
    path: "rubrique/" + props.rubriqueId,
  });
  updatePathParams(data.name);
  title.value = data.name;
}, {immediate: true});

</script>
