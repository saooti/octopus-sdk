<template>
    <div
        v-if="rubriqueIds.length && init"
        class="rubrique-list-component d-flex align-items-start mb-3 small-text"
    >
        <span class="label fw-bold py-1 my-1">
            {{ t("Rubrics") }}&nbsp;:
        </span>
        <ul class="d-flex flex-wrap">
            <li
                v-for="rubriqueId in rubriqueIds"
                :key="rubriqueId"
            >
                <router-link
                    class="d-flex align-items-center border p-1 m-1 text-dark"
                    :to="{
                        name: 'rubrique',
                        params: { rubriqueId: rubriqueId},
                        query: organisationQuery
                    }"
                >
                    {{ rubriquagesOrga[rubriqueId]?.name ?? rubriqueId }}
                </router-link>
            </li>
        </ul>
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
const saveFetchStore = useSaveFetchStore();

//Computed
const organisationQuery = computed(() => {
    if(filterStore.filterOrgaId){
        return undefined;
    }
    return { o: props.orgaId};
});

onBeforeMount(fetchRubriquages)


//Methods
async function fetchRubriquages(){
    const tempRubriquagesOrga = await saveFetchStore.getOrgaRubriques(props.orgaId);
    const rubriquesArray= tempRubriquagesOrga.flatMap((rub) =>rub.rubriques);
    rubriquagesOrga.value= rubriquesArray.reduce((results, u)=> {results[u.rubriqueId??0] = u; return results}, {} as {[key:number]:Rubrique});
    init.value = true;
}
</script>

<style scoped lang="scss">
.rubrique-list-component {
    .label {
        border: 1px solid transparent;
    }

    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
    }
}
</style>
