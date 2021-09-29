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

<style lang="scss"></style>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'MessageModal',
  props: {
    title: { default: undefined as string|undefined},
    active: { default: false as boolean},
    closable: { default: true as boolean},
    message: { default: undefined as string|undefined},
    validatetext: { default: undefined as string|undefined},
    canceltext: { default: undefined as string|undefined},
    thirdText: { default: undefined as string|undefined},
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
