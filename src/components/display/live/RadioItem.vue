<template>
  <div v-if="radio" class="d-flex border w-100 p-3">
    <RadioImage :radio="radio" />
    <router-link
      :to="{
        name: 'radio',
        params: { canalId: radio.id },
      }"
      class="text-dark classic-element-text"
      :title="t('Radio name page', { name: radio.name })"
    >
      <div class="element-name mb-2 basic-line-clamp">
        {{ radio.name }}
      </div>
      <div v-if="radio.description" class="basic-line-clamp ten-line">
        {{ radio.description }}
      </div>
      <RadioCurrently :radio="radio" />
    </router-link>
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
})

//Composables
const { t } = useI18n();
</script>
