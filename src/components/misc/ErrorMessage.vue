<template>
  <div class="d-flex" v-if="message && message.length">
    <div
      class="d-flex align-items-center bg-error-message p-2 rounded mt-1 mb-1"
    >
      <img src="/img/caution.png" class="icon-caution" />
      <div class="alert-text">{{ message }}</div>
    </div>
  </div>
</template>
<style lang="scss">
.bg-error-message {
  background-color: #ffd84a9c;
}
</style>

<script lang="ts">
export default {
  name: 'ErrorMessage',
  props: {
    message: { default: undefined as string|undefined},
  },
};
</script>
