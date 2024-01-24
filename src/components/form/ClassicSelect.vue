<template>
  <div class="classic-select">
    <label
      :for="idSelect"
      class="form-label mt-2"
      :class="displayLabel ? '' : 'd-none'"
      >{{ label }}</label
    >
    <select
      :id="idSelect"
      :value="textInit"
      :disabled="isDisabled"
      class="c-hand w-100"
      :class="transparent ? 'transparent' : ''"
      :style="getFontFamily"
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
  .classic-select select {
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" role="presentation"><path fill="%233c3c3c80" d="M9.211364 7.59931l4.48338-4.867229c.407008-.441854.407008-1.158247 0-1.60046l-.73712-.80023c-.407008-.441854-1.066904-.441854-1.474243 0L7 5.198617 2.51662.33139c-.407008-.441853-1.066904-.441853-1.474243 0l-.737121.80023c-.407008.441854-.407008 1.158248 0 1.600461l4.48338 4.867228L7 10l2.211364-2.40069z"></path></svg>') !important;
    background-repeat: no-repeat !important;
    background-position-x: calc(100% - 6px) !important;
    background-position-y: 0.7rem !important;
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
