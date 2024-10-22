<template>
  <div class="page-element-title-container">
    <div class="page-element-title">
      <h1>{{ pageTitle }}</h1>
    </div>
    <div class="page-element-bg" :style="backgroundDisplay" />
  </div>
</template>

<script lang="ts">
import imageProxy from "../../mixins/imageProxy";
import { defineComponent } from "vue";
export default defineComponent({
  mixins: [imageProxy],

  props: {
    pageTitle: { default: undefined, type: String },
    imageUrl: { default: undefined, type: String },
  },
  computed: {
    backgroundDisplay(): string {
      if (!this.imageUrl) {
        return "";
      }
      return `background-image: url('${this.proxyImageUrl(
        this.imageUrl,
        "250",
      )}');`;
    },
  },
});
</script>
<style lang="scss">
.octopus-app {
  .page-element.page-element-podcastmaker {
    margin-top: 11rem;
  }
  .page-element-title-container {
    background: black;
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    .page-element-bg {
      height: 15rem;
      opacity: 0.5;
      filter: blur(8px);
      -webkit-filter: blur(8px);
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
    }
    .page-element-title {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      h1 {
        color: white !important;
        font-size: 2rem;
      }
    }
  }
}
</style>
