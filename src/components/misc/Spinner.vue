<template>
  <div
    class="octopus-spinner"
    :class="small?'small':''"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: "Spinner",
  props: {
    small: { default: false, type: Boolean },
  },
})
</script>
<style lang="scss">
.octopus-app .octopus-spinner{
  display: inline-block;
  width:2rem;
  height:2rem;
  border-radius: 50%;
  animation: 0.75s linear infinite spinner-border;
  border: 2px solid currentcolor;
  border-right-color: transparent;
  flex-shrink: 0;

  &.small{
    width:1rem;
    height:1rem;
  }

  @keyframes spinner-border {
    to { transform: rotate(360deg); }
  }
}
</style>