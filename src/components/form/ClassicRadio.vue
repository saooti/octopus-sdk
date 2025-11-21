<!--
  Simple component to display radio buttons.

  Available slots:
    `label-{option.value}`: Slot to replace the label of the current option.
                            Binding: `option`: the current option
    `after-{option.value}`: Slot after the radio button
                            Binding: `option`: the current option
-->
<template>
  <div role="radiogroup" class="d-flex" :class="isColumn ? 'flex-column' : ''">
    <div
      v-for="option in options"
      :key="option.title"
      class="octopus-form-item"
      :class="isColumn ? 'd-flex flex-nowrap align-items-center' : 'me-2'"
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
        <slot :name="'label-' + option.value" :option="option">{{ option.title }}</slot>
      </label>

      <slot :name="'after-' + option.value" :option="option" />
    </div>
  </div>
</template>

<script setup lang="ts">

//Props 
defineProps({
  idRadio: { default: "", type: String },
  isDisabled: { default: false, type: Boolean },
  options: {
    default: () => [],
    type: Array as () => Array<{ title: string; value: string | undefined }>,
  },
  textInit: { default: undefined, type: String },
  isColumn: { default: true, type: Boolean },
})

//Emits
const emit = defineEmits(["update:textInit"]);

//Methods
function onChange(value:string){
  emit('update:textInit', value)
}

</script>
