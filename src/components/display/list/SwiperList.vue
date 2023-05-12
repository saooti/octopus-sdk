<template>
  <swiper
    :slides-per-view="numberItem"
    :space-between="0"
    :loop="listObject.length>=numberItem"
    :navigation="true"
    :modules="modules"
  >
    <swiper-slide
      v-for="(obj, index) in listObject"
      :key="obj"
    >
      <slot name="octopusSlide" :option="obj" :index="index"/>
    </swiper-slide>
  </swiper>
</template>

<script lang="ts">
import domHelper from '../../../helper/dom';
import { state } from '../../../stores/ParamSdkStore';
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'SwiperList',
  
  components: {
    Swiper,
    SwiperSlide,
  },

  props: {
    listObject: { default: [], type: Array as ()=> Array<unknown>},
  },

  data() {
    return {
      modules: [Navigation],
      numberItem: 5 as number
    };
  },
  computed: {
    sizeItem(): number {
      if (window.innerWidth <= 450) {
        return 12.5;
      }
      return state.generalParameters.podcastItem ? state.generalParameters.podcastItem: 16.5;
    },
  },
  
  created() {
    window.addEventListener('resize', this.handleResize);
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },

  mounted() {
    this.handleResize();
  },
  methods: {
    handleResize(): void {
      if (!this.$el) return;
      const width = (this.$el as HTMLElement).offsetWidth - 95;
      const sixteen = domHelper.convertRemToPixels(this.sizeItem+ 0.5);
      this.numberItem = Math.max(1, Math.floor(width / sixteen));
    },
  },
})
</script>
<style lang="scss">
@import '@scss/_variables.scss';
.swiper {
  width: 100%;
  height: 100%;
}
.swiper-button-next, .swiper-button-prev{
  color: $octopus-primary-color !important;
  height: 100%;
  top: 0;
  bottom: 0;
  margin: 0;
}
.swiper-button-next{
  right: 0;
}
.swiper-button-prev{
  left: 0;
}
.swiper-slide-active{
  padding-left:27px;
  @media (max-width: 550px) {
    padding-left:0;
  }
}
.swiper-slide-next{
  padding-right:27px;
}
.swiper-button-lock{
  display: flex;
}
.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>