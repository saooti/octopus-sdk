<template>
  <b-modal
    id="message-modal"
    :title="title"
    :show="true"
    @close="closePopup"
    @hide="closePopup"
    @cancel="closePopup"
  >
    <template
      v-if="!closable"
      #modal-header-close
    >
      <span />
    </template>
    <template #default>
      <div
        class="content"
        v-html="message"
      >
        {{ message }}
      </div>
    </template>
    <template
      v-if="validatetext"
      #modal-footer
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
    </template>
    <template
      v-else
      #modal-footer
    >
      <span />
    </template>
  </b-modal>
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