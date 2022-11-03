<template>
  <div
    class="octopus-accordion"
  >
    <button
      class="btn-transparent w-100 p-2 text-start d-flex align-items-center"
      @click="isOpen=!isOpen"
    >
      <span class="flex-grow-1">{{ title }}</span>
      <span class="saooti-down" />
    </button>
    <div
      v-show="isOpen"
      class="body p-2"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: "Accordion",
	props: {
    title: { default: '', type: String },
  },
	emits:['open'],
  data () {
    return {
			isOpen: false as boolean,
    }
  },
  watch:{
    isOpen(){
      this.$emit('open');
    }
  }
});
</script>
<style lang="scss">
.octopus-accordion{
	border: 1px solid #ccc;
  .body{
    border-top: 1px solid #ccc;
  }
}
</style>