<template>
  <span
    :aria-hidden="!title"
    class="material-design-icon"
    :title="title"
    role="img"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      :fill="fillColor"
      :height="size"
      :width="size"
    >
      <path
        d="m12 0c-6.628 0-12 5.372-12 12s5.372 12 12 12 12-5.372 12-12-5.372-12-12-12zm3.564 12a3.564 3.564 0 1 0 -3.564 3.564v2.036a5.6 5.6 0 1 1 5.6-5.6zm3.436 0a7 7 0 1 0 -7 7v2.333a9.333 9.333 0 1 1 0-18.666 9.333 9.333 0 0 1 9.333 9.333z"
      />
    </svg>
  </span>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "PocketCastIcon",
  props: {
    size: { default: 24, type: Number },
    title: { default: undefined, type: String },
    fillColor: { default: "#f43e37", type: String },
  },
});
</script>
