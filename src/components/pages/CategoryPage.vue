<template>
  <section class="page-box">
    <h1>{{ title }}</h1>
    <PodcastList
      :first="0"
      :size="30"
      :iab-id="iabId"
      :organisation-id="orgaArray"
    />
  </section>
</template>

<script setup lang="ts">
import PodcastList from "../display/podcasts/PodcastList.vue";
import { useFilterStore } from "../../stores/FilterStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { computed, watch } from "vue";
import { Category } from "@/stores/class/general/category";


//Props 
const props = defineProps({
  iabId: { default: undefined, type: Number },
})

//Composables
const generalStore = useGeneralStore();
const filterStore = useFilterStore();

//Computed
const orgaArray = computed(() => filterStore.filterOrgaId ? [filterStore.filterOrgaId] : []);
const title = computed(() => {
  const matchCategories = generalStore.storedCategories.filter(
    (c: Category) => c.id === props.iabId,
  );
  if (1 !== matchCategories.length) return "";
  return matchCategories[0]["name"];
});


//Watch
watch(title, () => {
  document.title = title.value + ' - ' + generalStore.metaTitle
}, {immediate: true});

</script>
