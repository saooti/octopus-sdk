<template>
  <div class="octopus-spinner" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: "Spinner",
})
</script>
<style lang="scss">
.octopus-app .octopus-spinner{
  display: inline-block;
  width:2rem;
  height:2rem;
  border-radius: 50%;
  animation: 0.75s linear infinite spinner-border;
  border: 0.25rem solid currentcolor;
  border-right-color: transparent;
  flex-shrink: 0;

  @keyframes spinner-border {
    to { transform: rotate(360deg); }
  }
}
</style>