<template>
  <div class="classic-select" :class="{ 'form-margin': displayLabel }">
    <label v-show="displayLabel" :for="idSelect" :class="classLabel">{{
      label
    }}</label>
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
      <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
      <option
        v-for="option in optionsOrder"
        :key="option.title"
        :value="option.value"
        :data-selenium="'select-option-' + option.value"
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
    topOption: { default: undefined,type: Object as () => {
      title: string;
      value: number | string | undefined;
      fontFamily?: string;
    },
    },
    textInit: { default: undefined, type: [String, Number] },
    classLabel: { default: "form-label", type: String },
    orderOptions: { default: true, type: Boolean},
    placeholder: { default: undefined, type: String},
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
    optionsOrder(){
      const optionsOrdered = Array.from(this.options);
      if(this.orderOptions){
        optionsOrdered.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)); 
      }
      if(this.topOption){
        optionsOrdered.unshift(this.topOption);
      }
      return optionsOrdered;
    }
  },
});
</script>
<style lang="scss">


.octopus-app {
  select option:checked,
  select option:hover {
    box-shadow: 0 0 10px 100px var(--octopus-secondary) inset;
  }

  select:focus > option:checked {
    background: var(--octopus-secondary) !important;
  }

  select.transparent {
    background: transparent !important;
    outline-color: transparent !important;
    padding: 0;
    border: 0;
    height: unset;
    appearance: auto !important;
  }
}
</style>
