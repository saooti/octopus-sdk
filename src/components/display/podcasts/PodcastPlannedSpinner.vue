<template>
  <div class="processing-planned-spinner d-flex align-items-center my-2 bg-secondary-light  p-3">
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


.octopus-app .processing-planned-spinner{
  .cube {
    margin-right:1rem;
    font-size: 24px;
    height: 1em;
    width: 1em;
    position: relative;
    transform: rotateX(30deg) rotateY(45deg);
    transform-style: preserve-3d;
    animation: cube-spin 2.5s infinite ease-in-out alternate;
  }

  .side {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
  }

  .side::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--octopus-primary);
    transform: translateZ(0.5em);
    animation: cube-explode 1.5s infinite ease-in-out;
    opacity: 0.5;
  }

  .side:nth-child(1) {
    transform: rotateY(90deg);
  }

  .side:nth-child(2) {
    transform: rotateY(180deg);
  }

  .side:nth-child(3) {
    transform: rotateY(270deg);
  }

  .side:nth-child(4) {
    transform: rotateY(360deg);
  }

  .side:nth-child(5) {
    transform: rotateX(90deg);
  }

  .side:nth-child(6) {
    transform: rotateX(270deg);
  }

  @keyframes cube-spin {
    0% {
      transform: rotateX(30deg) rotateY(45deg);
    }

    100% {
      transform: rotateX(30deg) rotateY(405deg);
    }
  }

  @keyframes cube-explode {
    0% {
      transform: translateZ(0.5em);
    }

    50% {
      transform: translateZ(0.75em);
    }

    100% {
      transform: translateZ(0.5em);
    }
  }

}
</style>