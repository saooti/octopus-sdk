<template>
  <div class="d-flex">
    <div class="d-flex flex-column align-items-center flex-shrink-0 me-4">
      <div class="h4 mb-2">
        {{ t("Choose color") }}
      </div>
      <VSwatches
        :model-value="color"
        class="c-hand"
        show-fallback
        fallback-input-type="color"
        colors="text-advanced"
        popover-to="right"
        :data-color="color"
        @update:model-value="emitColor($event)"
      />
    </div>
    <div class="d-flex flex-column align-items-center">
      <div class="h4 mb-2">
        {{ t("Choose theme") }}
      </div>
      <VSwatches
        :model-value="theme"
        class="c-hand"
        show-fallback
        fallback-input-type="color"
        colors="text-advanced"
        popover-to="right"
        :data-color="theme"
        @update:model-value="emitTheme($event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { VSwatches } from "vue3-swatches";
import "vue3-swatches/dist/style.css";
import { useI18n } from "vue-i18n";

//Props 
defineProps({
  color: { default: "#40a372", type: String },
  theme: { default: "#000000", type: String },
})

//Emits
const emit = defineEmits(["update:color", "update:theme"]);

//Composables
const { t } = useI18n();

//Methods
function emitColor(color: string){
  emit('update:color', color);
}
function emitTheme(theme: string){
  emit('update:theme', theme);
}
</script>
