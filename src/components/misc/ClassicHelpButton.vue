<!--
  A simple component to display a help button that shows its message when
  hovered.

  Usage: 
    <ClassicHelpButton>This is my help message</ClassicHelpButton>
-->
<template>
  <button
    :id="computedId"
    class="btn-transparent"
  >
    <!-- Button icon -->
    <HelpCircleIcon :size="30" />

    <!-- Tooltip -->
    <ClassicPopover
      :target="computedId"
      popover-class="popover-z-index"
    >
      <div class="reset">
        <slot />
      </div>
    </ClassicPopover>
  </button>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';

import HelpCircleIcon from "vue-material-design-icons/HelpCircle.vue";
import ClassicPopover from './ClassicPopover.vue';

/** The internal ID for the elements */
const computedId = computed(() => {
  return 'popover-' + getCurrentInstance()?.uid;
});
</script>

<style lang="scss" scoped>
.reset {
  font: revert;
}
</style>