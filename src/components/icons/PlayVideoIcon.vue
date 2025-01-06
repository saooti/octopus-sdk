<template>
  <span
    :aria-hidden="!title"
    class="material-design-icon"
    :title="title"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -70 1050 1050"
      style="transform: scale(1, -1)"
      :height="size"
      :width="size"
      :fill="fillColor"
    >
      <path
        d="M993.722 668.405l-143.934-82.076v97.691c0 43.841-36.034 79.874-79.874 79.874h-690.042c-43.841 0-79.874-35.833-79.874-79.674v-472.24c0-43.841 36.034-79.874 79.874-79.874h690.242c43.841 0 79.874 36.034 79.874 79.874v97.691l142.733-82.076c33.631-19.018 74.269 4.404 74.269 42.64v355.531c0.801 38.236-40.838 61.657-73.268 42.64zM542.903 424.578l-177.565-104.497c-19.018-11.21-42.64 2.202-42.64 23.622v208.995c0 21.42 23.622 34.832 42.64 23.622l177.565-104.497c19.018-10.21 19.018-37.235 0-47.244z"
      />
    </svg>
  </span>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "PlayVideoIcon",
  props: {
    size: { default: 24, type: Number },
    title: { default: undefined, type: String },
    fillColor: { default: "currentColor", type: String },
  },
});
</script>
