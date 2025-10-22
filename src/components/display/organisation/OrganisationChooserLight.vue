<template>
  <ClassicSelect
    v-if="init && organisation"
    :text-init="actual"
    :display-label="false"
    id-select="organisation-chooser-footer"
    :label="t('select productor')"
    :transparent="true"
    :options="[
      { title: organisation.name, value: organisation.id },
      { title: t('No organisation filter'), value: 'NONE' },
    ]"
    class="my-1"
    @update:text-init="updateOrganisation"
  />
</template>

<script setup lang="ts">
import ClassicSelect from "../../form/ClassicSelect.vue";
import { Organisation } from "@/stores/class/general/organisation";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useFilterStore } from "../../../stores/FilterStore";

//Emits
const emit = defineEmits(["selected"]);

//Data 
const organisation = ref<Organisation|undefined>(undefined);
const init = ref(false);

//Composables
const { t } = useI18n();
const SaveFetchStore = useSaveFetchStore();
const filterStore = useFilterStore();

// Computed
const actual = computed(() => {
  if (filterStore.filterOrgaId) {
    return filterStore.filterOrgaId;
  } else {
    return 'NONE';
  }
});

//Watch
watch(()=>filterStore.realOrgaId, async () => {
  fetchOrganisation();
}, {deep: true, immediate: true});
 
//Methods
async function fetchOrganisation(): Promise<void> {
  if (!filterStore.realOrgaId) {
    return;
  }
  organisation.value = await SaveFetchStore.getOrgaData(filterStore.realOrgaId);
  init.value = true;
}

function updateOrganisation(value: string): void {
  emit("selected", "NONE" === value ? undefined : organisation.value);
}
</script>