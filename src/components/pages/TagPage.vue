<template>
  <section class="page-box tag-page">
    <h1>
      {{ $t("Search for keyword", {tag:tagDisplay})}}
      <img
        v-if="isOf"
        width="30"
        height="30"
        class="ouest-france-logo-tag-page"
        role="presentation"
        alt=""
        src="/img/ouest_france_logo.svg" 
      />
    </h1>
    <ProductorSearch
      v-model:organisation-id="organisationId"
      v-model:search-pattern="searchPattern"
    />
    <PodcastList
      :first="paginateFirst"
      :size="ps"
      :include-tag="[tag]"
      :organisation-id="orgaArray"
      :query="searchMinSize"
      :sort-criteria="sortOrder ?? 'DATE'"
    />
  </section>
</template>

<script setup lang="ts">
import { useSimplePageParam } from "../composable/route/useSimplePageParam";
import { useTagOf } from "../composable/useTagOf";
import PodcastList from "../display/podcasts/PodcastList.vue";
import { computed, defineAsyncComponent, ref, watch } from "vue";
const ProductorSearch = defineAsyncComponent(
  () => import("../display/filter/ProductorSearch.vue"),
);

const props = defineProps({
  pr: { default: 0, type: Number },
  ps: { default: 30, type: Number },
  tag: { default: undefined, type: String },
  routeOrga: { default: undefined, type: String },
  routeQuery: { default: "", type: String },
});

const {
  searchPattern,
  organisationId,
  searchMinSize,
  paginateFirst,
} = useSimplePageParam(props);

const { isOuestFranceTag, formateOfTag } = useTagOf();

const orgaArray = computed(() =>organisationId.value ? [organisationId.value] : []);
const tagDisplay = computed(() => {
  const tagString = props.tag?? "";
  return isOf.value ?  formateOfTag(tagString) :tagString;
});
const isOf = computed(() => {
  return isOuestFranceTag(props.tag?? "");
});
const sortOrder = computed(() =>{
  if(searchMinSize.value.length){
    return "SCORE";
  }
  return undefined;
});

</script>
<style lang="scss">
.octopus-app .tag-page{
  .ouest-france-logo-tag-page{
    width: 30px;
    height: 30px;
    margin-left: 10px;
    vertical-align: center;
    @media (width <= 500px) {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
