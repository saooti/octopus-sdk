<!--
  Simple component to display a checkbox
  Use `v-model:text-init` to bind the value.

  **Slots:**
    `after-label` : A slot to display additional elements after the label
-->
<template>
    <div class="d-flex flex-nowrap align-items-center octopus-form-item">
        <div :class="isSwitch ? 'octopus-form-switch me-2' : ''">
            <input
                :id="computedIdCheckbox"
                :checked="textInit"
                type="checkbox"
                :role="isSwitch ? 'switch' : undefined"
                :disabled="isDisabled"
                :title="displayLabel ? '' : label"
                :data-selenium="selenium"
                @input="emit('update:textInit', !textInit)"
                @click="emitClickAction"
            >
            <!-- Visual only: the input above is the actual switch, stretched over it -->
            <span
                v-if="isSwitch"
                class="slider"
                aria-hidden="true"
            />
        </div>
        <label
            class="c-hand"
            :class="[classLabel, displayLabel ? '' : 'd-none', isDisabled ? 'disabled' : '']"
            :for="computedIdCheckbox"
        >
            {{ label }}

        </label>
        <slot name="after-label" />
    </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';

//Props 
const props = defineProps({
    /** The ID for the checkbox input */
    idCheckbox: { default: "", type: String },
    /** The label to display with the checkbox */
    label: { default: "", type: String },
    /** Disables input */
    isDisabled: { default: false, type: Boolean },
    /** The value of the checkbox */
    textInit: { default: false, type: Boolean },
    /** If true, displays a switch instead of a checkbox */
    isSwitch: { default: false, type: Boolean },
    displayLabel: { default: true, type: Boolean },
    classLabel: { default: "", type: String },
    selenium: { default: "", type: String },
})

//Emits
const emit = defineEmits(["update:textInit", "clickAction"]);

// Computed
const computedIdCheckbox = computed(() => {
    return props.idCheckbox || 'checkbox-' + getCurrentInstance()?.uid;
});

//Methods
function emitClickAction(): void {
    emit("clickAction");
}
</script>

<style lang="scss">
.octopus-app {

  label.disabled {
    color: var(--octopus-text-disabled);
    cursor: default;
  }

  .octopus-form-switch {
    position: relative;
    display: inline-block;
    width: 2rem;
    height: 1rem;

    // Invisible but covering the slider, so it receives clicks and focus directly
    input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
      z-index: 1;
      cursor: pointer;
    }

    input:disabled {
      cursor: default;
    }

    .slider {
      position: absolute;
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

    input:disabled + .slider::before {
      background-color: var(--octopus-text-disabled);
      opacity: 0.6;
    }

    input:checked + .slider {
      background-color: var(--octopus-primary);
    }

    // The input is transparent: show the global focus style on the slider instead
    input:focus-visible + .slider {
      box-shadow: 0 0 10px 1px var(--octopus-focus-color);
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
