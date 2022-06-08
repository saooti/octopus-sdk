<template>
  <div
    class="btn-split"
    @mouseleave="mobileHoverEffect=false"
  >
    <div class="d-flex flex-wrap">
      <slot name="inside-button" />
    </div>
    <div class="label">
      {{ title }}
    </div> 
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    title: { default: '', type:String},
  },
   
  data() {
    return {
      mobileHoverEffect:false as boolean,
    };
  },
  computed:{
    isMobile(): boolean {
      return window.matchMedia('(hover: none)').matches;
    },
  },

  methods: {
    linkClick(event: { preventDefault: () => void; }){
      if(this.isMobile && !this.mobileHoverEffect){
        this.mobileHoverEffect = true;
        event.preventDefault();
      }
    },
  },
})
</script>