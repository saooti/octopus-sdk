<template>
  <div>
    <button
      :class="classBtn"
      @click="onCopyCode(afterCopy)"
    >
      {{ textDisplayed }}
    </button>
    <SnackBar 
      v-if="lazyLoadingSnackbar" 
      ref="snackbar" 
      position="bottom-left"
    />
  </div>
</template>

<script setup lang="ts">
import SnackBar from "../misc/SnackBar.vue";
import displayHelper from "../../helper/displayHelper";
import { computed, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  text: { default: undefined, type: String },
  textAfterCopy: { default: undefined, type: String },
  dataToCopy: { default: undefined, type: String },
  snackbarText: { default: undefined, type: String },
  classBtn: { default: "btn btn-primary w-fit-content my-3", type: String },
})

//Data 
const hasBeenCopied = ref(false);
const lazyLoadingSnackbar = ref(false);
const snackBarRef = useTemplateRef('snackbar');


//Composables
const { t } = useI18n();


//Computed
const textDisplayed = computed(() => hasBeenCopied.value ? props.textAfterCopy : props.text);

//Methods
function onCopyCode(callback: () => void){
  displayHelper.onCopyCode(props.dataToCopy??"", callback);
}
function afterCopy(): void {
  hasBeenCopied.value = true;
  if (!lazyLoadingSnackbar.value) {
    lazyLoadingSnackbar.value = true;
    setTimeout(() => {
      afterCopy();
    }, 500);
  } else {
    (snackBarRef?.value as InstanceType<typeof SnackBar>).open(props.snackbarText ?? t("Data in clipboard"));
  }
}
</script>
