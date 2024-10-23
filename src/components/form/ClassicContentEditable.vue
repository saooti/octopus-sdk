<template>
  <component
    :is="tag"
    ref="element"
    class="classic-content-editable"
    contenteditable
    :placeholder="placeholder"
    @input="emitUpdate"
    @blur="emitUpdate"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicContentEditable",
  props: {
    tag: { default: "span", type: String },
    modelValue: { default: "", type: String },
    placeholder: { default: "", type: String },
  },
  emits: ["update:modelValue"],
  watch: {
    modelValue() {
      if ((this.$refs.element as HTMLElement).innerText !== this.modelValue) {
        this.updateContent(this.modelValue);
      }
    },
  },
  mounted() {
    this.updateContent(this.modelValue);
  },
  methods: {
    updateContent(newcontent: string) {
      (this.$refs.element as HTMLElement).innerText = newcontent;
    },
    emitUpdate() {
      if (null !== (this.$refs.element as HTMLElement)) {
        this.$emit(
          "update:modelValue",
          (this.$refs.element as HTMLElement).innerText,
        );
      }
    },
  },
});
</script>
<style lang="scss">
@use "@scss/variables" as octopusVariables;
.octopus-app .classic-content-editable {
  &[placeholder]:empty::before {
    content: attr(placeholder);
    color: octopusVariables.$octopus-primary-color;
  }

  &[placeholder]:empty:focus::before {
    content: "";
  }
}
</style>
