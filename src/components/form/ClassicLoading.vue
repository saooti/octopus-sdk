<template>
  <div
    v-if="loadingText"
    class="d-flex justify-content-center"
  >
    <div class="spinner-border me-3" />
    <h3 class="mt-2">
      {{ loadingText }}
    </h3>
  </div>
  <div
    v-else-if="errorText"
    class="text-center"
  >
    <h3>{{ errorText }}</h3>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: "ClassicLoading",
  props: {
    loadingText: { default: undefined, type: String},
    errorText: { default: undefined, type: String},
  }
})
</script>