<template>
  <div
    v-if="message && message.length"
    class="d-flex"
  >
    <div
      class="d-flex align-items-center bg-error-message p-2 rounded my-1"
    >
      <img
        src="/img/caution.png"
        class="icon-caution"
      >
      <div class="alert-text">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ErrorMessage',
  props: {
    message: { default: undefined, type: String},
  },
})
</script>

<style lang="scss">
.octopus-app{
.bg-error-message {
  background-color: #ffd84a9c;
}
.alert-text{
  color: darkred;
}
}
</style>
