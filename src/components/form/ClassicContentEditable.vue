<template>
  <component
    :is="tag"
    ref="element"
    class="classic-content-editable"
    contenteditable
    :placeholder="placeholder"
    @input="emitUpdate"
    @blur="emitUpdate"
  />
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from 'vue';


//Props 
const props = defineProps({
  tag: { default: "span", type: String },
  modelValue: { default: "", type: String },
  placeholder: { default: "", type: String },
})

//Emits
const emit = defineEmits(["update:modelValue"]);

//Data
const elementRef = useTemplateRef('element');

//Watch
watch(()=>props.modelValue, () => {
  const element = elementRef?.value as HTMLElement;
  if (element.innerText !== props.modelValue) {
    updateContent(props.modelValue);
  }
});

onMounted(()=>updateContent(props.modelValue))

//Methods
function updateContent(newcontent: string) {
  const element = elementRef?.value as HTMLElement;
  element.innerText = newcontent;
}
function emitUpdate() {
  const element = elementRef?.value as HTMLElement;
  if (null !== element) {
    emit( "update:modelValue",element.innerText);
  }
}
</script>
<style lang="scss">

.octopus-app .classic-content-editable {
  &[placeholder]:empty::before {
    content: attr(placeholder);
    color: var(--octopus-primary);
  }

  &[placeholder]:empty:focus::before {
    content: "";
  }
}
</style>
