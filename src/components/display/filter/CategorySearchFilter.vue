<template>
  <div class="d-flex mt-3 align-items-center">
    <ClassicCheckbox
      v-model:text-init="isCategory"
      class="flex-shrink-0 me-2"
      id-checkbox="search-category-checkbox"
      :label="t('By category')"
    />
    <CategoryChooser
      :category-selected="iabIdIntern"
      width="100%"
      :defaultanswer="t('No category filter')"
      @update:category-selected="updateIabId"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";
import CategoryChooser from "../categories/CategoryChooser.vue";
import { ref, watch } from "vue";

//Props 
const props = defineProps({
  iabId: { default: undefined, type: Number },
})


//Emits
const emit = defineEmits(["update:iabId"]);

//Data 
const isCategory = ref(false);
const iabIdIntern = ref(0);

//Composables
const { t } = useI18n();
  
//Watch
watch(()=>props.iabId, () => {
  isCategory.value = undefined !== props.iabId;
  if (props.iabId && props.iabId !== iabIdIntern.value) {
    iabIdIntern.value = props.iabId;
  }
}, {immediate: true});
watch(isCategory, () => {
  const value = isCategory.value ? iabIdIntern.value : undefined;
  if (value !== props.iabId) {
    emit("update:iabId", value);
  }
});

//Methods
function updateIabId(iabId: number) {
  iabIdIntern.value = iabId;
  if (isCategory.value) {
    emit("update:iabId", iabIdIntern.value);
  } else {
    isCategory.value = true;
  }
}
</script>
