<template>
  <div class="paginate">
    <ClassicSelect
      :text-init="rowsPerPage"
      :id-select="'rows-per-page-select'+id"
      :label="t('Items per page :')"
      :display-label="true"
      class-label="flex-shrink-0 me-1"
      class="d-flex align-items-center mb-0"
      :options="optionRowsPerPage"
      @update:text-init="emit('update:rowsPerPage', parseInt($event, 10))"
    />
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ClassicSelect from "../../form/ClassicSelect.vue";
import { onBeforeMount, ref } from "vue";

//Props 
const props = defineProps({
  rowsPerPage: { default: 0, type: Number },
  id: { default: "", type: String },
})

//Emits
const emit = defineEmits(["update:rowsPerPage"]);

//Data 
const optionsRowsPerPage = ref([10, 20, 30, 40, 50, 60]);
const optionRowsPerPage = ref([
  {title:"10", value: 10},
  {title:"20", value: 20},
  {title:"30", value: 30},
  {title:"40", value: 40},
  {title:"50", value: 50},
  {title:"60", value: 60},
]);

//Composables
const { t } = useI18n();


onBeforeMount(()=>initRowsPerPage())

//Methods
function initRowsPerPage() {
  if (optionsRowsPerPage.value.includes(props.rowsPerPage)) {
    return;
  }
  optionsRowsPerPage.value.push(props.rowsPerPage);
  optionsRowsPerPage.value.sort((a, b) => a - b);
}
</script>
<style lang="scss">
.octopus-app .paginate {
  display: flex;
  justify-content: flex-end;

  select {
    border-top: 0;
    border-right: 0;
    border-left: 0;
    background: transparent !important;
    padding-right: 0.4rem;
  }
}
</style>
