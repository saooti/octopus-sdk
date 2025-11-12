<template>
  <div class="d-flex">
    <div class="d-flex align-items-center bg-warning p-2 rounded my-1">
      <AlertIcon :title="t('Warning')" class="me-1 text-danger" :size="16" />
      <div class="text-danger">
        <slot>{{ message }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AlertIcon from "vue-material-design-icons/Alert.vue";
import { useI18n } from "vue-i18n";

//Props 
defineProps({
  message: { default: undefined, type: String },
})

//Composables
const { t } = useI18n();
</script>

