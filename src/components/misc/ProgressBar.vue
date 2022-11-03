<template>
  <div
    class="octopus-progress"
  >
    <div
      v-if="secondaryProgress"
      class="octopus-progress-bar bg-light"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="'width: ' + secondaryProgress + '%'"
    />
    <div
      class="octopus-progress-bar primary-bg"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="'width: ' + mainProgress + '%'"
    />
    <div
      v-if="alertBar"
      class="octopus-progress-bar octopus-progress-bar-duration bg-danger"
      :style="'left: ' + alertBar + '%'"
    />
    <div
      v-if="isProgressCursor"
      class="progress-bar-cursor"
      :style="'left:' + mainProgress + '%'"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ProgressBar',
  props: {
    alertBar: { default: undefined, type: Number},
    mainProgress: { default: 0, type: Number},
    secondaryProgress: { default: 0, type: Number},
    isProgressCursor: { default: false, type: Boolean},
  },
})
</script>

<style lang="scss">
@import '@scss/_variables.scss';
.octopus-app{
  .octopus-progress{
    display: flex;
    overflow: hidden;
    background-color:#e9ecef;
    border-radius: 0.375rem;
    position: relative;
    cursor: pointer;

    .octopus-progress-bar{
      position: absolute;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
      color: white;
      text-align: center;
      white-space: nowrap;
      background-color: $octopus-primary-color;
      transition: width 0.6s ease;
    }
    &,.octopus-progress-bar{
      height: 4px;
      @media (max-width: 960px) {
        height: 8px;
      }
    }
    &.large,&.large .octopus-progress-bar{
      height: 15px;
    }
    &.medium,&.medium .octopus-progress-bar{
      height: 6px;
    }
    .octopus-progress-bar-duration {
      width: 10px;
    }
    .octopus-progress-bar-cursor{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: black;
      align-self: center;
      position: absolute;
    }
  }
}
</style>