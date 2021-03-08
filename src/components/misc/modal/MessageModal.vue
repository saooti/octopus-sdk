<template>
  <b-modal
    id="message-modal"
    @close="closePopup"
    @hide="closePopup"
    @cancel="closePopup"
    :title="title"
  >
    <template v-slot:modal-header-close v-if="!closable">
      <span></span>
    </template>
    <template v-slot:default>
      <div class="content" v-html="message"></div>
    </template>
    <template v-slot:modal-footer v-if="validatetext">
      <button v-if="canceltext" class="btn btn-light m-1" @click="onCancel">
        {{ canceltext }}
      </button>
      <button
        v-if="thirdText"
        class="btn btn-primary m-1"
        @click="onThirdAction"
      >
        {{ thirdText }}
      </button>
      <button class="btn btn-primary m-1" @click="onValid">
        {{ validatetext }}
      </button>
    </template>
    <template v-slot:modal-footer v-else>
      <span></span>
    </template>
  </b-modal>
</template>

<style lang="scss"></style>
<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'MessageModal',

  props: [
    'title',
    'active',
    'closable',
    'message',
    'validatetext',
    'canceltext',
    'thirdText',
  ],

  mounted() {
    this.$bvModal.show('message-modal');
  },

  methods: {
    closePopup(event) {
      event.preventDefault();
      this.$emit('close');
    },
    onValid() {
      this.$emit('validate');
    },
    onCancel() {
      this.$emit('cancel');
    },
    onThirdAction() {
      this.$emit('thirdEvent');
    },
  },
});
</script>
