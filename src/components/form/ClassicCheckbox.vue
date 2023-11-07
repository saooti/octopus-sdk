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
        @input="$emit('update:textInit', !textInit)"
        @click="emitClickAction"
      />
      <span
        v-if="isSwitch"
        class="slider"
        @click="
          $emit('update:textInit', !textInit);
          emitClickAction;
        "
      />
    </div>
    <label
      class="c-hand"
      :class="displayLabel ? '' : 'd-none'"
      :for="idCheckbox"
      >{{ label }}</label
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicCheckbox",

  props: {
    idCheckbox: { default: "", type: String },
    label: { default: "", type: String },
    isDisabled: { default: false, type: Boolean },
    textInit: { default: false, type: Boolean },
    isSwitch: { default: false, type: Boolean },
    displayLabel: { default: true, type: Boolean },
    selenium: { default: "", type: String },
  },
  emits: ["update:textInit", "clickAction"],
  methods: {
    emitClickAction(): void {
      this.$emit("clickAction");
    },
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
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
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.4s;
      border-radius: 1rem;
    }
    .slider:before {
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
      background-color: $octopus-primary-color;
    }
    input:focus + .slider {
      box-shadow: 0 0 1px $octopus-primary-color;
    }
    input:checked + .slider:before {
      transform: translateX(1rem);
    }
  }
}
</style>
