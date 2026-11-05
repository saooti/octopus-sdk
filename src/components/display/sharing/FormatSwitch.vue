<template>
  <fieldset class="format-switch">
    <legend class="visually-hidden">
      {{ t("FormatSwitch - Format") }}
    </legend>
    <template v-for="format in formats" :key="format.label">
      <input
        :id="`${id}-${format.label}`"
        v-model="isSvg"
        class="format-switch-input"
        type="radio"
        :name="id"
        :value="format.isSvg"
      >
      <label class="format-switch-option" :for="`${id}-${format.label}`">
        {{ format.label }}
      </label>
    </template>
  </fieldset>
</template>

<script setup lang="ts">
import { useId } from "vue";
import { useI18n } from "vue-i18n";

/**
 * Choice of the file format (SVG or PNG), as a radio group displayed as a
 * switch
 */

const isSvg = defineModel<boolean>("isSvg", { default: true });

const { t } = useI18n();
const id = `format-switch-${useId()}`;
const formats = [
  { label: "SVG", isSvg: true },
  { label: "PNG", isSvg: false }
];
</script>

<style scoped lang="scss">
.format-switch {
  --format-switch-size: 140px;

  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: var(--format-switch-size);
  min-width: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 2px solid var(--octopus-secondary);
  border-radius: 30px;
  background: var(--octopus-secondary);
  // Unselected format, on the track: same colors as secondary buttons
  color: var(--octopus-btn-secondary-fg);

  // Pill behind the selected format
  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 50%;
    border-radius: 30px;
    background: white;
    transition: transform 300ms;
  }

  &:has(.format-switch-input:last-of-type:checked)::before {
    transform: translateX(100%);
  }

  &:has(.format-switch-input:focus-visible) {
    box-shadow: 0 0 10px 1px var(--octopus-primary) !important;
  }
}

// Hidden but still focusable, the labels are the visible part
.format-switch-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.format-switch-option {
  position: relative;
  padding: 0.5rem 0;
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.format-switch-input:checked + .format-switch-option {
  color: black;
}
</style>
