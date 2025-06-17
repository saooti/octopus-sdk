<template>
  <div
    v-if="rubriqueIds.length && init"
    class="rubrique-list-component d-flex align-items-center flex-wrap mb-3 small-text"
  >
    <div class="fw-bold me-3">
      {{ t("Rubrics") + " : " }}
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

<script setup lang="ts">
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { Rubrique } from "../../../stores/class/rubrique/rubrique";
import { useFilterStore } from "../../../stores/FilterStore";
import { useI18n } from "vue-i18n";
import { computed, onBeforeMount, Ref, ref } from "vue";

//Props 
const props = defineProps({
  rubriqueIds: { default: () => [], type: Array as () => Array<number> },
  orgaId: {default: "", type: String,},
})

//Data 
const init = ref(false);
const rubriquagesOrga: Ref<{[key:number]:Rubrique}> = ref({});

//Composables
const { t } = useI18n();
const filterStore = useFilterStore();
const SaveFetchStore = useSaveFetchStore();

//Computed
const organisationQuery = computed(() => {
  if(filterStore.filterOrgaId){
    return undefined;
  }
  return { o: props.orgaId};
});

onBeforeMount(()=>fetchRubriquages())


//Methods
async function fetchRubriquages(){
  const tempRubriquagesOrga = await SaveFetchStore.getOrgaRubriques(props.orgaId);
  const rubriquesArray= tempRubriquagesOrga.flatMap((rub) =>rub.rubriques);
  rubriquagesOrga.value= rubriquesArray.reduce((results, u)=> {results[u.rubriqueId??0] = u; return results}, {} as {[key:number]:Rubrique});
  init.value = true;
}
</script>
