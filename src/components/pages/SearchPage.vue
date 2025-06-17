<template>
  <section class="page-box">
    <h1>{{ titlePage }}</h1>
    <ClassicSearch
      v-model:text-init="rawQuery"
      :autofocus="true"
      id-search="search-page-input"
      :label="t('Please type at least three characters')"
    />
    <PodcastList
      v-if="!!query"
      :query="query"
      :first="0"
      :size="20"
      @empty-list="noResult = true"
    />
  </section>
</template>

<script setup lang="ts">
import ClassicSearch from "../form/ClassicSearch.vue";
import PodcastList from "../display/podcasts/PodcastList.vue";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  queryRoute: { default: "", type: String },
});

//Data 
const rawQuery = ref("");
const noResult = ref(false);

//Composables
const { t } = useI18n();


//Computed
const titlePage = computed(() =>{
  const locale = !noResult.value ? "Search results" : "Search - no results";
  return t(locale, { query: rawQuery.value });
});
const query = computed(() =>{
  return rawQuery.value && rawQuery.value.length >= 3 ? rawQuery.value : "";
});


//Watch
watch(()=>props.queryRoute, () => {
  rawQuery.value = props.queryRoute;
}, {immediate: true});
</script>
