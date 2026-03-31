<template>
  <div
    class="octopus-spinner"
    :style="style"
  >
    <div v-for="index of 12" :key="index" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

//Props 
const props = defineProps({
  small: { default: false, type: Boolean },
  color: { default: undefined, type: String }
})

const style = computed(() => ({
  '--size-spinner': props.small ? '1.5rem' : '3rem',
  '--color-spinner': props.color === undefined ? '#000000' : props.color
}));
</script>

<style lang="scss">
.octopus-app .octopus-spinner {

  --size-spinner: 3rem;
  --size-spinner-section: calc(var(--size-spinner) / 20);
  --half-size-spinner: calc(var(--size-spinner) / 2);
  --color-spinner: #000000;
  
  color: var(--color-spinner);
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
}
</style>
