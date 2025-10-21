<template>
  <ClassicSelect
    v-if="(!value || init) && organisation"
    v-model:text-init="actual"
    :display-label="false"
    id-select="organisation-chooser-footer"
    :label="t('select productor')"
    :transparent="true"
    :options="[
      { title: organisation.name, value: organisation.id },
      { title: t('No organisation filter'), value: 'NONE' },
    ]"
    class="my-1"
  />
</template>

<script setup lang="ts">
import ClassicSelect from "../../form/ClassicSelect.vue";
import { Organisation } from "@/stores/class/general/organisation";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { Ref, ref, watch } from "vue";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  value: { default: undefined, type: String },
  reset: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits(["selected"]);

//Data 
const actual = ref("NONE");
const organisation: Ref<Organisation | undefined> = ref(undefined);
const init = ref(false);

//Composables
const { t } = useI18n();
const SaveFetchStore = useSaveFetchStore();


//Watch
watch(()=>props.value, async () => {
  if (!init.value || props.value) {
    fetchOrganisation();
  }
}, {deep: true, immediate: true});
watch(()=>props.reset, async () => {
  actual.value = "NONE";
});
watch(actual, async () => {
  emit("selected","NONE" === actual.value ? undefined : organisation.value);
});
 
//Methods
async function fetchOrganisation(): Promise<void> {
  if (!props.value) {
    return;
  }
  organisation.value = await SaveFetchStore.getOrgaData(props.value);
  actual.value = organisation.value.id;
  init.value = true;
}
</script>