<template>
  <div
    id="message-modal"
    class="modal"
  >
    <div class="modal-backdrop" />
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ title }}
          </h5>
          <button
            v-if="closable"
            type="button"
            class="btn-close"
            title="Close"
            @click="closePopup"
          />
        </div>
        <div class="modal-body">
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="content"
            v-html="message"
          />
          <!-- eslint-enable -->
        </div>
        <div
          v-if="validatetext"
          class="modal-footer"
        >
          <button
            v-if="canceltext"
            class="btn btn-light m-1"
            @click="onCancel"
          >
            {{ canceltext }}
          </button>
          <button
            v-if="thirdText"
            class="btn btn-primary m-1"
            @click="onThirdAction"
          >
            {{ thirdText }}
          </button>
          <button
            class="btn btn-primary m-1"
            @click="onValid"
          >
            {{ validatetext }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'MessageModal',
  props: {
    title: { default: undefined, type: String},
    active: { default: false, type: Boolean},
    closable: { default: true, type: Boolean},
    message: { default: undefined, type: String},
    validatetext: { default: undefined, type: String},
    canceltext: { default: undefined, type: String},
    thirdText: { default: undefined, type: String},
  },
  emits: ['close', 'validate', 'cancel', 'thirdEvent'],
  methods: {
    closePopup(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.$emit('close');
    },
    onValid(): void {
      this.$emit('validate');
    },
    onCancel(): void {
      this.$emit('cancel');
    },
    onThirdAction(): void {
      this.$emit('thirdEvent');
    },
  },
})
</script>

<style lang="scss"></style>