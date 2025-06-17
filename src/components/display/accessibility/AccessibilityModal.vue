<template>
  <ClassicModalInBody
    id-modal="accessibility-modal"
    :title-modal="t('Transcript Accessibility')"
    @close="closePopup"
  >
    <template #body>
      <div class="d-flex gap-3 flex-wrap mb-3">
        <div class="d-flex flex-nowrap align-items-center flex-grow-1">
          <div class="form-label me-3">{{ t('Choose background color') }}</div>
          <VSwatches
            v-model:model-value="background"
            class="c-hand"
            show-fallback
            fallback-input-type="color"
            colors="text-advanced"
            popover-x="left"
            :data-color="color"
          />
        </div>
        <div class="d-flex flex-nowrap align-items-center flex-grow-1">
          <div class="form-label me-3">{{ t('Choose text color') }}</div> 
          <VSwatches
            v-model:model-value="color"
            class="c-hand"
            show-fallback
            fallback-input-type="color"
            colors="text-advanced"
            popover-x="left"
            :data-color="color"
          />
        </div>
      </div>

      <div class="d-flex align-items-center flex-nowrap mb-3">
        <label class="form-label me-3" for="accessibility-font-size">{{ t('Font size') }}</label> 
        <button class="btn me-3" :disabled="isMinSize" @click="decreaseFontSize"><FormatFontSizeDecreaseIcon :size="44"/></button>
        <button class="btn" :disabled="isMaxSize" @click="increaseFontSize"><FormatFontSizeIncreaseIcon :size="44"/></button>
      </div>
    
      <div class="form-label mt-3">{{ t('Preview') }}</div>
      <div class="border p-2 mb-3" :style="stylePreview">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
    </template>
    <template #footer>
      <button class="btn m-1" @click="closePopup">
        {{ t("No") }}
      </button>
      <button
        class="btn btn-primary m-1"
        @click="saveData"
      >
        {{ t("Save") }}
      </button>
    </template>
  </ClassicModalInBody>
</template>

<script setup lang="ts">
import { VSwatches } from "vue3-swatches";
import "vue3-swatches/dist/style.css";
import FormatFontSizeIncreaseIcon from "vue-material-design-icons/FormatFontSizeIncrease.vue";
import FormatFontSizeDecreaseIcon from "vue-material-design-icons/FormatFontSizeDecrease.vue";
import { computed, defineAsyncComponent, onBeforeMount, ref } from "vue";
import { useI18n } from "vue-i18n";
const ClassicModalInBody = defineAsyncComponent(
  () => import("../../misc/modal/ClassicModalInBody.vue"),
);

//Emits
const emit = defineEmits(["close", "save"]);

//Data 
const fontSize = ref(16);
const background = ref("white");
const color = ref("black");


//Composables
const { t } = useI18n();


//Computed
const isMaxSize = computed(() => fontSize.value>=30);
const isMinSize = computed(() => fontSize.value<=16);
const stylePreview = computed(() => 'font-size:'+fontSize.value+'px; background:'+background.value+'; color:'+color.value);

onBeforeMount(()=>initAccessibility())

//Methods
function initAccessibility(){
  const actualFontSize = getComputedStyle(document.documentElement).getPropertyValue('--octopus-accessibility-font-size');
  fontSize.value = isNaN(parseInt(actualFontSize.slice(0, -2), 10)) ? 16 :parseInt(actualFontSize.slice(0, -2), 10);
  background.value = getComputedStyle(document.documentElement).getPropertyValue('--octopus-accessibility-background');
  color.value = getComputedStyle(document.documentElement).getPropertyValue('--octopus-accessibility-color');
}
function closePopup() {
  emit("close");
}
function decreaseFontSize(){
  if(!isMinSize.value){
    fontSize.value -=2;
  }
}
function increaseFontSize(){
  if(!isMaxSize.value){
    fontSize.value +=2;
  }
}
function saveData(){
  emit('save', {
    fontSize: fontSize.value,
    background: background.value,
    color: color.value,
  });
}
</script>
<style lang="scss">
.octopus-app #accessibility-modal .octopus-modal-body{
  min-height: 400px;
  .gap-3{
    gap:1rem;
  }
}
</style>
