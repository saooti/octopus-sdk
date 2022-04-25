<template>
  <div
    v-if="loadingText"
    class="d-flex justify-content-center"
  >
    <div class="spinner-border me-3" />
    <div class="h3 mt-2">
      {{ loadingText }}
    </div>
  </div>
  <div
    v-else-if="errorText"
    class="text-center text-danger"
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