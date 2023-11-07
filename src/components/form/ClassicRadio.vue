<template>
  <div class="d-flex" :class="isColumn ? 'flex-column' : ''">
    <div
      v-for="option in options"
      :key="option.title"
      class="octopus-form-item"
      :class="isColumn ? 'd-flex flex-nowrap align-items-center' : 'me-2'"
    >
      <input
        :id="idRadio + option.value"
        :checked="textInit === option.value"
        type="radio"
        :name="idRadio"
        :value="option.value"
        :disabled="isDisabled"
        @input="$emit('update:textInit', $event.target.value)"
      />
      <label class="c-hand" :for="idRadio + option.value">{{
        option.title
      }}</label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicRadio",

  props: {
    idRadio: { default: "", type: String },
    isDisabled: { default: false, type: Boolean },
    options: {
      default: () => [],
      type: Array as () => Array<{ title: string; value: string | undefined }>,
    },
    textInit: { default: undefined, type: String },
    isColumn: { default: true, type: Boolean },
  },
  emits: ["update:textInit"],
});
</script>
