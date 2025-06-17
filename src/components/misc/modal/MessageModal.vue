<template>
  <ClassicModal
    id-modal="message-modal-frontoffice"
    :title-modal="title"
    :closable="closable"
    @close="closePopup"
  >
    <template #body>
      <!-- eslint-disable vue/no-v-html -->
      <div v-if="!save && !error" class="content" v-html="message" />
      <!-- eslint-enable -->
      <ClassicLoading
        v-if="save || error"
        :loading-text="save && !error ? t('Loading content ...') : undefined"
        :error-text="error ? t('An error occurred') : undefined"
      />
    </template>
    <template #footer>
      <template v-if="validatetext">
        <button v-if="canceltext" class="btn m-1" @click="onCancel">
          {{ canceltext }}
        </button>
        <button
          v-if="thirdText"
          class="btn btn-primary m-1"
          @click="onThirdAction"
        >
          {{ thirdText }}
        </button>
        <button
          v-if="!save"
          ref="focusElement"
          class="btn btn-primary m-1"
          @click="onValid"
        >
          {{ validatetext }}
        </button>
      </template>
    </template>
  </ClassicModal>
</template>

<script setup lang="ts">
import ClassicModal from "../modal/ClassicModal.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { onMounted, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
//Props 
const props = defineProps({
  title: { default: undefined, type: String },
  closable: { default: true, type: Boolean },
  message: { default: undefined, type: String },
  validatetext: { default: undefined, type: String },
  canceltext: { default: undefined, type: String },
  thirdText: { default: undefined, type: String },
  focus: { default: true, type: Boolean },
})


//Emits
const emit = defineEmits(["close","validate", "cancel", "thirdEvent"]);

//Data 
const save = ref(false);
const error = ref(false);
const focusElementRef = useTemplateRef('focusElement');



//Composables
const { t } = useI18n();


onMounted(()=>{
  if (props.focus) {
    (focusElementRef?.value as HTMLElement)?.focus();
  }
})

//Mehods
function closePopup(): void {
  emit("close");
}
function onValid(): void {
  save.value = true;
  emit("validate");
}
function onCancel(): void {
  emit("cancel");
}
function onThirdAction(): void {
  emit("thirdEvent");
}
</script>
