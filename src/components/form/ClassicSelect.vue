<template>
  <div class="classic-select" :class="{ 'form-margin': displayLabel }">
    <label
      :for="idSelect"
      :class="{'form-label':classFormLabel, 'd-none': !displayLabel}"
      >{{ label }}</label
    >
    <select
      :id="idSelect"
      :value="textInit"
      :disabled="isDisabled"
      class="c-hand w-100"
      :class="transparent ? 'transparent' : ''"
      :style="getFontFamily"
      :aria-label="label"
      @change="$emit('update:textInit', $event.target.value)"
    >
      <option
        v-for="option in options"
        :key="option.title"
        :value="option.value"
        :style="option.fontFamily ? 'font-family:' + option.fontFamily : ''"
      >
        {{ option.title }}
      </option>
    </select>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicSelect",
  props: {
    idSelect: { default: "", type: String },
    label: { default: "", type: String },
    displayLabel: { default: true, type: Boolean },
    transparent: { default: false, type: Boolean },
    isDisabled: { default: false, type: Boolean },
    options: {
      default: () => [],
      type: Array as () => Array<{
        title: string;
        value: number | string | undefined;
        fontFamily?: string;
      }>,
    },
    textInit: { default: undefined, type: [String, Number] },
    classFormLabel: { default: true, type: Boolean },
  },
  emits: ["update:textInit"],
  computed: {
    getFontFamily(): string {
      const item = this.options.find((x) => {
        return this.textInit === x.value;
      });
      if (item?.fontFamily) {
        return "font-family:" + item.fontFamily;
      }
      return "";
    },
  },
});
</script>
<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  select option:checked,
  select option:hover {
    box-shadow: 0 0 10px 100px #dddddd inset;
  }
  select:focus > option:checked {
    background: #dddddd !important;
  }
  select.transparent {
    background: transparent !important;
    outline-color: transparent !important;
    padding: 0;
    border: 0;
    height: unset;
    -webkit-appearance: auto !important;
    -moz-appearance: auto !important;
  }
}
</style>
