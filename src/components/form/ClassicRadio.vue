<template>
  <div
    class="d-flex"
    :class="isColumn? 'flex-column':''"
  >
    <div
      v-for="option in options"
      :key="option.title"
      class="form-check"
      :class="isColumn? '':'me-2'"
    >
      <input
        :id="idRadio + option.value"
        v-model="textValue"
        class="form-check-input"
        type="radio"
        :name="idRadio"
        :value="option.value"
        :disabled="isDisabled"
      >
      <label
        class="form-check-label"
        :for="idRadio + option.value"
      >{{
        option.title
      }}</label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ClassicRadio',

  props: {
    idRadio: { default: '', type: String },
    isDisabled: { default: false, type: Boolean },
    options: { default: ()=>[], type: Array as () => Array<{title: string, value: string|undefined}> },
    textInit: { default: undefined, type: String },
    isColumn: {default:true, type:Boolean}
  },
  emits: ['update:textInit'],

  data() {
    return {
      textValue: undefined as string|undefined,
    };
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
  }
});
</script>
