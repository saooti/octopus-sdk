<template>
  <div class="d-flex justify-content-around mt-3 w-100">
    <div class="d-flex flex-column align-items-center flex-shrink-0 me-3">
      <div>{{ $t('Choose color') }}</div>
      <VSwatches
        :model-value="color"
        class="c-hand "
        show-fallback
        colors="text-advanced"
        popover-to="right"
        :data-color="color"
        @update:modelValue="$emit('update:color',$event)"
      />
    </div>
    <div class="d-flex flex-column align-items-center">
      <div>{{ $t('Choose theme') }}</div>
      <VSwatches
        :model-value="theme"
        class="c-hand "
        show-fallback
        colors="text-advanced"
        popover-to="right"
        :data-color="theme"
        @update:modelValue="$emit('update:theme',$event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import VSwatches from 'vue3-swatches';
import { defineComponent } from 'vue';
export default defineComponent({
  components: {
    VSwatches
  },

  props: {
    color: { default: '#40a372', type: String},
    theme: { default: '#000000', type: String},
  },
  emits:['update:color', 'update:theme'],
})
</script>