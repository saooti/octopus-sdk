<template>
  <div class="position-relative champs-searchPage static-height">
    <input
      :id="idSearch"
      ref="search"
      v-model="textValue"
      type="text"
      class="search-input w-100 p-2 input-no-outline"
      :placeholder="label"
      :autofocus="autofocus"
    >
    <label
      :for="idSearch"
      :title="label"
    />
    <div
      v-if="!textValue"
      class="saooti-search-bounty search-icon-container"
    />
    <div
      v-else
      class="saooti-cross search-icon-container c-hand"
      @click="textValue = ''"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ClassicSearch',
 props: {
    idSearch: { default: '', type: String },
    label: { default: '', type: String },
    textInit: { default: '', type: String },
    autofocus: { default: false, type: Boolean },
  },

  emits: ['update:textInit'],

  data() {
    return {
      textValue: '' as string,
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
	}
});
</script>
<style lang="scss">
.champs-searchPage{
  input {
    border: 2px solid #dee2e6;
    border-radius: 10px;
    margin: 0 !important;
  }
  .saooti-search-bounty,
  .saooti-cross {
    font-size: 1rem;
  }
  .search-icon-container {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    margin: 1rem;
  }
} 
</style>