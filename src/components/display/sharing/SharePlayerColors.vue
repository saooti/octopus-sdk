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
      <div
        v-if="!isBeta"
        class="d-flex"
      >
        <VSwatches
          v-for="myColor in colors"
          :key="myColor"
          v-model="internTheme"
          :data-theme="internTheme"
          class="c-hand input-no-outline me-1"
          :swatch-style="{
            padding: '0px 0px',
            marginRight: '0px',
            marginBottom: '0px',
            border: '1px gray solid',
          }"
          :wrapper-style="{
            paddingTop: '0px',
            paddingLeft: '0px',
            paddingRight: '0px',
            paddingBottom: '0px',
          }"
          :swatches="[myColor]"
          inline
        />
      </div>
      <VSwatches
        v-else
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
    isBeta: { default: false, type: Boolean},
    color: { default: '#40a372', type: String},
    theme: { default: '#000000', type: String},
  },
  emits:['update:color', 'update:theme'],

  data() {
    return {
      internColor:'#40a372' as string,
      internTheme:'#000000' as string,
      colors: ['#000000', '#ffffff'],
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
      if(this.theme !== this.internTheme){
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