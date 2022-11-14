<template>
  <div
    class="octopus-accordion my-2"
  >
    <button
      :id="'accordion-'+idComposer"
      class="btn-transparent bg-white w-100 p-2 text-start d-flex align-items-center"
      :class="isOpen?'really-light-primary-bg':''"
      @click="isOpen=!isOpen"
    >
      <span
        v-if="icon"
        class="img-accordion text-primary"
        :class="icon"
      />
      <img
        v-if="imageUrl"
        width="30"
        height="30"
        class="img-accordion"
        :src="imageUrl"
        :alt="title"
      >
      <span class="flex-grow-1">{{ title }}</span>
      <span :class="isOpen?'saooti-up': 'saooti-down'" />
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
    idComposer: { default: '', type: String },
    icon:{default: undefined, type: String },
    imageUrl:{default: undefined, type: String },
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
  >button{
    height: 50px;
  }
  .img-accordion {
    width: 30px;
    height: 30px;
    margin-right: 1rem;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .body{
    border-top: 1px solid #ccc;
  }
}
</style>