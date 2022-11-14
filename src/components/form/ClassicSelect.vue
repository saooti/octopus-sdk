<template>
  <div class="classic-select">
    <label
      :for="idSelect"
      class="form-label mt-2"
      :class="displayLabel?'':'d-none'"
    >{{ label }}</label>
    <select
      :id="idSelect"
      :model-value="textInit"
      :disabled="isDisabled"
      class="c-hand w-100"
      :class="transparent?'transparent':''"
      :style="getFontFamily"
      @update:modelValue="$emit('update:textInit',$event)"
    >
      <option
        v-for="option in options"
        :key="option.title"
        :value="option.value"
        :style="option.fontFamily ? 'font-family:'+option.fontFamily:''"
      >
        {{ option.title }}
      </option>
    </select>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ClassicSelect',
  props: {
    idSelect: { default: '', type: String },
    label: { default: '', type: String },
    displayLabel:{default: true, type: Boolean},
    transparent:{ default: false, type: Boolean },
    isDisabled: { default: false, type: Boolean },
    options: { default: ()=>[], type: Array as () => Array<{title: string, value: string|undefined, fontFamily?: string}> },
    textInit: { default: undefined, type: String },
  },
  emits: ['update:textInit'],
  computed:{
    getFontFamily(): string{
      const item = this.options.find((x) => {
        return this.textInit === x.value;
      });
      if(item && item.fontFamily){
        return 'font-family:'+item.fontFamily;
      }
      return "";
    }
  },
});
</script>
<style lang="scss">
.octopus-app{
  select.transparent {
		background: transparent !important;
		outline-color: transparent !important;
		padding:0;
		border: 0;
		height: unset;
	}
}
</style>