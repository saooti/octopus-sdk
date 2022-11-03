<template>
  <ClassicModal
    id-modal="message-modal"
    :title-modal="title"
    :closable="closable"
    @close="closePopup"
  >
    <template #body>
      <!-- eslint-disable vue/no-v-html -->
      <div
        class="content"
        v-html="message"
      />
      <!-- eslint-enable -->
    </template>
    <template
      v-if="validatetext"
      #footer
    >
      <button
        v-if="canceltext"
        :ref="!closable && canceltext?'focusElement':''"
        class="btn m-1"
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
        :ref="!closable && !canceltext?'focusElement':''"
        class="btn btn-primary m-1"
        @click="onValid"
      >
        {{ validatetext }}
      </button>
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import ClassicModal from '../modal/ClassicModal.vue';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'MessageModal',
  components: {
    ClassicModal
  },
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
    closePopup(): void {
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