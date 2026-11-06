<template>
  <div v-if="radio" class="d-flex border w-100 p-3">
    <RadioImage :radio="radio" />
    <div class="text-dark classic-element-text position-relative">
      <!-- Heading: cards can be browsed by title with screen readers (RGAA 9.1) -->
      <component :is="titleTag" class="element-name mb-2 basic-line-clamp">
        <router-link
          :to="{
            name: 'radio',
            params: { canalId: radio.id },
          }"
          class="text-dark element-link"
          :title="t('Radio name page', { name: radio.name })"
        >
          {{ radio.name }}
        </router-link>
      </component>
      <div v-if="radio.description" class="basic-line-clamp ten-line">
        {{ radio.description }}
      </div>
      <RadioCurrently :radio="radio" />
    </div>
  </div>
</template>

<script setup lang="ts">
import RadioImage from "./RadioImage.vue";
import RadioCurrently from "./RadioCurrently.vue";
import { Canal } from "@/stores/class/radio/canal";
import { useI18n } from "vue-i18n";

//Props 
defineProps({
  radio: { default: undefined, type: Object as () => Canal },
  /** Tag to use for the radio title */
  titleTag: { default: 'h3', type: String },
})

//Composables
const { t } = useI18n();
</script>
