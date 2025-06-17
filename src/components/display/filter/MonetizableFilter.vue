<template>
  <ClassicSelect
    v-model:text-init="monetisableForVmodel"
    id-select="monetizable-filter-select"
    :label="t('Advertising') + ' :'"
    :display-label="true"
    class-label="flex-shrink-0 me-1"
    class="d-flex align-items-center"
    :options="[
      { title: allString, value: 'UNDEFINED' },
      { title: t('Authorized advertising'), value: 'YES' },
      { title: t('Prohibited advertising'), value: 'NO' },
    ]"
  />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ClassicSelect from "../../form/ClassicSelect.vue";
import { computed } from "vue";


//Props 
const props = defineProps({
  isEmission: { default: false, type: Boolean },
  monetisable: { default: "UNDEFINED", type: String },
})

//Emits
const emit = defineEmits(["update:monetisable"]);

//Composables
const { t } = useI18n();

//Computed
const allString = computed(() => props.isEmission? t("All emissions"): t("All podcasts"));
const monetisableForVmodel = computed({
  get(): string {
    return props.monetisable;
  },
  set(value: string) {
    emit("update:monetisable", value);
  },
});

</script>
