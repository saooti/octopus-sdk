<template>
  <div class="d-flex">
    <div class="d-flex flex-column align-items-center flex-shrink-0 me-4">
      <div class="h4 mb-2">
        {{ t("Choose color") }}
      </div>
      <ClassicColorPicker
        :model-value="color"
        :label="t('Choose color')"
        class="c-hand"
        :data-color="color"
        @update:model-value="emitColor($event)"
      />
    </div>
    <div class="d-flex flex-column align-items-center">
      <div class="h4 mb-2">
        {{ t("Choose theme") }}
      </div>
      <ClassicColorPicker
        :model-value="theme"
        :label="t('Choose theme')"
        class="c-hand"
        :data-color="theme"
        @update:model-value="emitTheme($event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ClassicColorPicker from "../../form/ClassicColorPicker.vue";
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
