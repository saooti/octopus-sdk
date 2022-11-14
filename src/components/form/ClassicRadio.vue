<template>
  <div
    class="d-flex"
    :class="isColumn? 'flex-column':''"
  >
    <div
      v-for="option in options"
      :key="option.title"
      class="octopus-form-item"
      :class="isColumn? '':'me-2'"
    >
      <input
        :id="idRadio + option.value"
        :model-value="textInit"
        type="radio"
        :name="idRadio"
        :value="option.value"
        :disabled="isDisabled"
        @update:modelValue="$emit('update:textInit',$event)"
      >
      <label
        class="c-hand"
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
});
</script>
<style lang="scss">
@import '@scss/_variables.scss';
.octopus-app{
  input[type="radio"] {
    accent-color: $octopus-primary-color;
    cursor: pointer;
    margin-right: 5px;
  }
}
</style>