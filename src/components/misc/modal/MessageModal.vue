<template>
  <ClassicModal
    id-modal="message-modal-frontoffice"
    :title-modal="title"
    :closable="closable"
    @close="closePopup"
  >
    <template #body>
      <!-- eslint-disable vue/no-v-html -->
      <div v-if="!save && !error" class="content" v-html="message" />
      <!-- eslint-enable -->
      <ClassicLoading
        v-if="save || error"
        :loading-text="save && !error ? $t('Loading content ...') : undefined"
        :error-text="error ? $t('An error occurred') : undefined"
      />
    </template>
    <template #footer>
      <template v-if="validatetext">
        <button v-if="canceltext" class="btn m-1" @click="onCancel">
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
          v-if="!save"
          ref="focusElement"
          class="btn btn-primary m-1"
          @click="onValid"
        >
          {{ validatetext }}
        </button>
      </template>
    </template>
  </ClassicModal>
</template>

<script lang="ts">
import ClassicModal from "../modal/ClassicModal.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "MessageModal",
  components: {
    ClassicModal,
    ClassicLoading,
  },
  props: {
    title: { default: undefined, type: String },
    closable: { default: true, type: Boolean },
    message: { default: undefined, type: String },
    validatetext: { default: undefined, type: String },
    canceltext: { default: undefined, type: String },
    thirdText: { default: undefined, type: String },
    focus: { default: true, type: Boolean },
  },

  emits: ["close", "validate", "cancel", "thirdEvent"],
  data() {
    return {
      save: false as boolean,
      error: false as boolean,
    };
  },
  mounted() {
    if (this.focus) {
      (this.$refs.focusElement as HTMLElement)?.focus();
    }
  },
  methods: {
    closePopup(): void {
      this.$emit("close");
    },
    onValid(): void {
      this.save = true;
      this.$emit("validate");
    },
    onCancel(): void {
      this.$emit("cancel");
    },
    onThirdAction(): void {
      this.$emit("thirdEvent");
    },
  },
});
</script>
