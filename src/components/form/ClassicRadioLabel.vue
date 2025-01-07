<template>
  <div class="d-flex flex-column">
    <div v-if="radioLabel" :class="classLabel">{{ radioLabel }}</div>
    <ClassicRadio
      :id-radio="idRadio"
      :is-disabled="isDisabled"
      :options="options"
      :text-init="textInit"
      :is-column="isColumn"
      @update:text-init="$emit('update:textInit', $event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ClassicRadio from "./ClassicRadio.vue";
export default defineComponent({
  name: "ClassicRadioLabel",
  components:{
    ClassicRadio
  },

  props: {
    idRadio: { default: "", type: String },
    isDisabled: { default: false, type: Boolean },
    options: {
      default: () => [],
      type: Array as () => Array<{ title: string; value: string | undefined }>,
    },
    textInit: { default: undefined, type: String },
    isColumn: { default: true, type: Boolean },
    radioLabel: { default: undefined, type: String },
    classLabel: { default: "form-label", type: String },
  },
  emits: ["update:textInit"]
});
</script>
