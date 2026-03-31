<template>
  <div
    v-if="loadingText"
    class="d-flex align-items-center justify-content-center"
  >
    <ClassicSpinner :small="small" :color="spinnerColor" class="me-3" />
    <div :class="small ? 'text-secondary' : 'h3'">
      {{ loadingText }}
    </div>
  </div>
  <div v-else-if="errorText" class="text-center text-danger">
    <h3>{{ errorText }}</h3>
  </div>
</template>

<script setup lang="ts">
import ClassicSpinner from "../misc/ClassicSpinner.vue";

//Props 
defineProps({
  loadingText: { default: undefined, type: String },
  errorText: { default: undefined, type: String },
  /** Reduce size of the loading animation and text */
  small: { default: false, type: Boolean },
  /** Color of the spinner */
  spinnerColor: { default: undefined, type: String }
})
</script>
