<template>
  <div
    v-if="loadingText"
    class="d-flex align-items-center justify-content-center"
  >
    <ClassicSpinner class="me-3" />
    <div class="h3 mt-2">
      {{ loadingText }}
    </div>
  </div>
  <div v-else-if="errorText" class="text-center text-danger">
    <h3>{{ errorText }}</h3>
  </div>
</template>

<script lang="ts">
import ClassicSpinner from "../misc/ClassicSpinner.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicLoading",
  components: {
    ClassicSpinner,
  },
  props: {
    loadingText: { default: undefined, type: String },
    errorText: { default: undefined, type: String },
  },
});
</script>
