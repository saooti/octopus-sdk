<template>
  <ClassicCheckbox
    :text-init="insertCode"
    id-checkbox="insert-code-checkbox"
    :label="t('Insert custom code')"
    @update:text-init="updateInsertCode($event)"
  />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";

//Props 
defineProps({
  insertCode: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits(["update:insertCode"]);

//Composables
const { t } = useI18n();

//Methods
function updateInsertCode(value:boolean){
  emit('update:insertCode', value)
}
</script>
