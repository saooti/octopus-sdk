<template>
  <div class="octopus-spinner" :style="small ? '--size-spinner:1rem;' : ''" >
    <div v-for="index of 12" :key="index"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicSpinner",
  props: {
    small: { default: false, type: Boolean },
  },
});
</script>
<style lang="scss">
.octopus-app .octopus-spinner {

  --size-spinner: 3rem;
  --size-spinner-section: calc(var(--size-spinner) / 20);
  --half-size-spinner: calc(var(--size-spinner) / 2);

  color: #000000;
  display: inline-block;
  position: relative;
  width: var(--size-spinner);
  height: var(--size-spinner);

  div {
    transform-origin: var(--half-size-spinner) var(--half-size-spinner);
    animation: octopus-spinner 1.2s linear infinite;
  }
  div:after {
    content: " ";
    display: block;
    position: absolute;
    top: 3px;
    left: calc(var(--half-size-spinner) - calc(var(--size-spinner-section) / 2));
    width: var(--size-spinner-section);
    height: calc(var(--half-size-spinner) / 3);
    border-radius: 20%;
    background: currentColor;
  }
  div:nth-child(1) {
    transform: rotate(0deg);
    animation-delay: -1.1s;
  }
  div:nth-child(2) {
    transform: rotate(30deg);
    animation-delay: -1s;
  }
  div:nth-child(3) {
    transform: rotate(60deg);
    animation-delay: -0.9s;
  }
  div:nth-child(4) {
    transform: rotate(90deg);
    animation-delay: -0.8s;
  }
  div:nth-child(5) {
    transform: rotate(120deg);
    animation-delay: -0.7s;
  }
  div:nth-child(6) {
    transform: rotate(150deg);
    animation-delay: -0.6s;
  }
  div:nth-child(7) {
    transform: rotate(180deg);
    animation-delay: -0.5s;
  }
  div:nth-child(8) {
    transform: rotate(210deg);
    animation-delay: -0.4s;
  }
  div:nth-child(9) {
    transform: rotate(240deg);
    animation-delay: -0.3s;
  }
  div:nth-child(10) {
    transform: rotate(270deg);
    animation-delay: -0.2s;
  }
  div:nth-child(11) {
    transform: rotate(300deg);
    animation-delay: -0.1s;
  }
  div:nth-child(12) {
    transform: rotate(330deg);
    animation-delay: 0s;
  }
  @keyframes octopus-spinner {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
 /*  display: inline-block;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  animation: 0.75s linear infinite spinner-border;
  border: 2px solid currentcolor;
  border-right-color: transparent;
  flex-shrink: 0;

  &.small {
    width: 1rem;
    height: 1rem;
  }

  @keyframes spinner-border {
    to {
      transform: rotate(360deg);
    }
  } */
}
</style>
