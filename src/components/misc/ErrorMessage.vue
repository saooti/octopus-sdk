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
.icon-caution {
  margin-right: 5px;
  margin-bottom: 2px;
  height: 25px;
}
</style>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ErrorMessage',

  props: ['message'],
});
</script>
