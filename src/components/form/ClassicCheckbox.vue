<template>
  <div
    class="form-check"
    :class="isSwitch?'form-switch':''"
  >
    <input
      :id="idCheckbox"
      v-model="textValue"
      type="checkbox"
      class="form-check-input"
      :disabled="isDisabled"
      :title="displayLabel?'':label"
      :data-selenium="selenium"
      @click="emitClickAction"
    >
    <label
      class="form-check-label"
      :class="displayLabel? '': 'd-none'"
      :for="idCheckbox"
    >{{ label }}</label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ClassicCheckbox',

  props: {
    idCheckbox: { default: '', type: String },
    label: { default: '', type: String },
    isDisabled: { default: false, type: Boolean },
    textInit: { default: false, type: Boolean },
    isSwitch:{default:false, type:Boolean},
    displayLabel: {default:true, type: Boolean},
    selenium: { default: '', type: String },
  },
  emits: ['update:textInit', 'clickAction'],

  data() {
    return {
      textValue: false as boolean,
    };
  },
  watch: {
    textValue(){
			if(this.textInit !== this.textValue){
				this.$emit('update:textInit', this.textValue)
			}
		},
		textInit(){
			if(this.textInit !== this.textValue){
				this.textValue =this.textInit;
			}
		}
  },
  mounted(){
		this.textValue = this.textInit;
	},
  methods:{
    emitClickAction():void{
      this.$emit('clickAction');
    }
  }
});
</script>
