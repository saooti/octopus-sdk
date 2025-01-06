<template>
  <div class="d-flex">
    <div class="d-flex align-items-center bg-error-message p-2 rounded my-1">
      <AlertIcon :title="$t('Warning')" class="me-1 text-danger" :size="16" />
      <div class="alert-text">
        {{ message }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import AlertIcon from "vue-material-design-icons/Alert.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "ErrorMessage",
  components: {
    AlertIcon,
  },
  props: {
    message: { default: undefined, type: String },
  },
});
</script>
<style lang="scss">
.octopus-app {
  .bg-error-message {
    background-color: #ffd84a9c;
  }
  .alert-text {
    color: darkred;
  }
}
</style>
