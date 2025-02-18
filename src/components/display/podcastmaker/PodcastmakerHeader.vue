<template>
  <div class="page-element-title-container">
    <div class="page-element-title">
      <h1>{{ pageTitle }}</h1>
    </div>
    <div class="page-element-bg" :style="backgroundDisplay" />
  </div>
</template>

<script lang="ts">
import {useImageProxy} from "../../composable/useImageProxy";
import { defineComponent } from "vue";
export default defineComponent({

  props: {
    pageTitle: { default: undefined, type: String },
    imgUrl: { default: undefined, type: String },
  },
  setup(){
    const { useProxyImageUrl } = useImageProxy();
    return { useProxyImageUrl }
  },
  computed: {
    backgroundDisplay(): string {
      if (!this.imgUrl) {
        return "";
      }
      return `background-image: url('${this.useProxyImageUrl(
        this.imgUrl,
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
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
    }

    .page-element-title {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: flex;
      justify-content: center;
      align-items: center;

      h1 {
        color: white !important;
        font-size: 2rem;
      }
    }
  }
}
</style>
