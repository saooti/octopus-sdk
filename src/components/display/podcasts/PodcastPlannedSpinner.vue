<template>
  <div class="processing-planned-spinner d-flex align-items-center my-2 bg-secondary  p-3">
    <div class="cube">
      <div class="side"></div>
      <div class="side"></div>
      <div class="side"></div>
      <div class="side"></div>
      <div class="side"></div>
      <div class="side"></div>
    </div>
    <div class="fw-bold">{{$t('The episode is being processed')}}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "PodcastPlannedSpinner",
});
</script>
<style lang="scss">
@use "@scss/variables" as octopusVariables;
.octopus-app .processing-planned-spinner{
  .cube {
    margin-right:1rem;
    font-size: 24px;
    height: 1em;
    width: 1em;
    position: relative;
    transform: rotatex(30deg) rotatey(45deg);
    transform-style: preserve-3d;
    animation: cube-spin 2.5s infinite ease-in-out alternate;
  }
  .side {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    transform-style: preserve-3d;
  }
  .side::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: octopusVariables.$octopus-primary-color;
    transform: translatez(0.5em);
    animation: cube-explode 1.5s infinite ease-in-out;
    opacity: 0.5;
  }
  .side:nth-child(1) {
    transform: rotatey(90deg);
  }
  .side:nth-child(2) {
    transform: rotatey(180deg);
  }
  .side:nth-child(3) {
    transform: rotatey(270deg);
  }
  .side:nth-child(4) {
    transform: rotatey(360deg);
  }
  .side:nth-child(5) {
    transform: rotatex(90deg);
  }
  .side:nth-child(6) {
    transform: rotatex(270deg);
  }
  @keyframes cube-spin {
    0% {
      transform: rotatex(30deg) rotatey(45deg);
    }
    100% {
      transform: rotatex(30deg) rotatey(405deg);
    }
  }
  @keyframes cube-explode {
    0% {
      transform: translatez(0.5em);
    }
    50% {
      transform: translatez(0.75em);
    }
    100% {
      transform: translatez(0.5em);
    }
  }

}
</style>