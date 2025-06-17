<template>
  <div class="d-flex flex-nowrap align-items-center octopus-form-item">
    <div :class="isSwitch ? 'octopus-form-switch me-2' : ''">
      <input
        :id="idCheckbox"
        :checked="textInit"
        type="checkbox"
        :disabled="isDisabled"
        :title="displayLabel ? '' : label"
        :data-selenium="selenium"
        :tabindex="isSwitch ? '-1' : '0'"
        @input="emit('update:textInit', !textInit)"
        @click="emitClickAction"
      />
      <button
        v-if="isSwitch"
        class="slider btn-transparent"
        :title="label"
        @click="clickSlider"
        @keydown.space.prevent="clickSlider"
      />
    </div>
    <label
      class="c-hand"
      :class="[classLabel, displayLabel ? '' : 'd-none']"
      :for="idCheckbox"
      >{{ label }}</label
    >
  </div>
</template>

<script setup lang="ts">
//Props 
const props = defineProps({
  idCheckbox: { default: "", type: String },
  label: { default: "", type: String },
  isDisabled: { default: false, type: Boolean },
  textInit: { default: false, type: Boolean },
  isSwitch: { default: false, type: Boolean },
  displayLabel: { default: true, type: Boolean },
  classLabel: { default: "", type: String },
  selenium: { default: "", type: String },
})

//Emits
const emit = defineEmits(["update:textInit", "clickAction"]);

//Methods
function emitClickAction(): void {
  emit("clickAction");
}
function clickSlider() {
  if (!props.isDisabled) {
    emit("update:textInit", !props.textInit);
    emitClickAction();
  }
}
</script>

<style lang="scss">
.octopus-app {
  .octopus-form-switch {
    position: relative;
    display: inline-block;
    width: 2rem;
    height: 1rem;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: var(--octopus-secondary-darker);
      transition: 0.4s;
      border-radius: 1rem;
    }

    .slider::before {
      position: absolute;
      content: "";
      height: 0.8rem;
      width: 0.8rem;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: var(--octopus-primary);
    }

    input:focus + .slider {
      box-shadow: 0 0 1px var(--octopus-primary);
    }

    input:checked + .slider::before {
      transform: translateX(1rem);
    }

    input:disabled + .slider {
      cursor: default;
      background-color: var(--octopus-secondary-darker);
    }
  }
}
</style>
