<template>
  <div class="d-flex justify-content-around mt-3 flex-grow w-100">
    <div class="d-flex flex-column align-items-center flex-shrink me-3">
      <div class="fw-600">
        {{ $t('Choose color') }}
      </div>
      <VSwatches
        v-model="internColor"
        class="c-hand input-no-outline"
        show-fallback
        colors="text-advanced"
        popover-to="right"
        :data-color="internColor"
      />
    </div>
    <div class="d-flex flex-column align-items-center">
      <div class="fw-600">
        {{ $t('Choose theme') }}
      </div>
      <VSwatches
        v-model="internTheme"
        class="c-hand input-no-outline"
        show-fallback
        colors="text-advanced"
        popover-to="right"
        :data-color="internTheme"
      />
    </div>
  </div>
</template>

<script lang="ts">
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

  data() {
    return {
      internColor:'#40a372' as string,
      internTheme:'#000000' as string,
    };
  },
  watch:{
    color(){
      if(this.color !== this.internColor){
        this.internColor = this.color;
      }
    },
    internColor(){
      if(this.color !== this.internColor){
        this.$emit('update:color', this.internColor);
      }
    },
    theme(){
      if(this.theme !== this.internTheme){
        this.internTheme = this.theme;
      }
    },
    internTheme(){
      if(this.theme !== this.internTheme ){
        this.$emit('update:theme', this.internTheme);
      }
    }
  },
  mounted(){
    this.internColor= this.color;
    this.internTheme= this.theme;
  }
})
</script>