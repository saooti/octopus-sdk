<!--
  Simple component to display radio buttons.

  Available slots:
    `label-{option.value}`: Slot to replace the label of the current option.
                            Binding: `option`: the current option
                                     `selected` : true if the option is selected
    `after-{option.value}`: Slot after the radio button
                            Binding: `option`: the current option
                                     `selected` : true if the option is selected
-->
<template>
  <div role="radiogroup" class="d-flex" :class="isColumn !== false ? 'flex-column' : ''">
    <div
      v-for="option in options"
      :key="option.title"
      class="octopus-form-item"
      :class="isColumn !== false ? 'd-flex flex-nowrap align-items-center' : 'me-2'"
    >
      <input
        :id="idRadio + option.value"
        :checked="textInit === option.value"
        type="radio"
        :name="idRadio"
        :value="option.value"
        :disabled="isDisabled"
        @input="onChange($event.target.value)"
      >
      <label class="c-hand" :for="idRadio + option.value">
        <slot :name="'label-' + option.value" v-bind="slotBindings(option)">{{ option.title }}</slot>
      </label>

      <slot :name="'after-' + option.value" v-bind="slotBindings(option)" />
    </div>
  </div>
</template>

<script setup generic="T extends { title: string; value: string|undefined; }" lang="ts">
//Props 
const { textInit, isColumn = true } = defineProps<{
  options: Array<T>;
  textInit?: string;
  idRadio?: string;
  isDisabled?: boolean;
  isColumn?: boolean;
}>();

//Emits
const emit = defineEmits<{
  (e: 'update:textInit', value: string): void;
}>();

//Methods
function onChange(value: string){
  emit('update:textInit', value)
}

function slotBindings(option: T): { option: T; selected: boolean } {
  return {
    option,
    selected: textInit === option.value
  }
}
</script>
