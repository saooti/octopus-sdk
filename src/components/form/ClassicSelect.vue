<template>
  <div class="classic-select">
    <label
      :for="idSelect"
      class="form-label mt-2"
      :class="displayLabel?'':'d-none'"
    >{{ label }}</label>
    <select
      :id="idSelect"
      v-model="textValue"
      :disabled="isDisabled"
      class="c-hand w-100"
      :style="getFontFamily"
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
    isDisabled: { default: false, type: Boolean },
    options: { default: ()=>[], type: Array as () => Array<{title: string, value: string|undefined, fontFamily?: string}> },
    textInit: { default: undefined, type: String },
  },
  emits: ['update:textInit'],
  data() {
    return {
      textValue: undefined as string|undefined,
    };
  },
  computed:{
    getFontFamily(): string{
      const item = this.options.find((x) => {
        return this.textValue === x.value;
      });
      if(item && item.fontFamily){
        return 'font-family:'+item.fontFamily;
      }
      return "";
    }
  },
  watch: {
    textValue(){
			if(this.textInit !== this.textValue){
				this.$emit('update:textInit', this.textValue)
			}
		},
    textInit: {
      immediate: true,
      handler() {
        if(this.textInit !== this.textValue){
          this.textValue =this.textInit;
        }
      },
    },
  },
});
</script>