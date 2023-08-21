<template>
  <div class="position-relative w-100">
    <template v-if="!isPhone">
      <button
        v-show="isLoop"
        class="btn-transparent swiper-button-prev"
        @click="slidePrevButton()"
      ></button>
      <swiper
        :slides-per-view="numberItem"
        :space-between="0"
        :loop="isLoop"
        :navigation="true"
        :modules="modules"
      >
        <swiper-slide v-for="(obj, index) in listObject" :key="obj">
          <slot name="octopusSlide" :option="obj" :index="index" />
        </swiper-slide>
      </swiper>
    </template>
    <div v-else class="element-list-inline">
      <div v-for="(obj, index) in listObject" :key="obj">
        <slot name="octopusSlide" :option="obj" :index="index" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import domHelper from "../../../helper/dom";
import { state } from "../../../stores/ParamSdkStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import resizePhone from "../../mixins/resizePhone";
import { defineComponent } from "vue";
export default defineComponent({
  name: "SwiperList",

  components: {
    Swiper,
    SwiperSlide,
  },
  mixins: [resizePhone],

  props: {
    listObject: { default: () => [], type: Array as () => Array<unknown> },
    sizeItemOverload: { default: undefined, type: Number },
  },

  data() {
    return {
      modules: [Navigation],
      numberItem: 5 as number,
      isPhone: false as boolean,
      windowWidth: 0 as number,
    };
  },
  computed: {
    sizeItem(): number {
      if (this.sizeItemOverload) {
        return this.sizeItemOverload;
      }
      if (this.windowWidth <= 450) {
        return 12.5;
      }
      return state.generalParameters.podcastItem
        ? state.generalParameters.podcastItem
        : 13.5;
    },
    isLoop(): boolean {
      return this.listObject.length >= this.numberItem;
    },
  },
  watch: {
    windowWidth() {
      if (!this.$el) return;
      const width = (this.$el as HTMLElement).offsetWidth - 95;
      const sixteen = domHelper.convertRemToPixels(this.sizeItem + 0.5);
      this.numberItem = Math.max(1, Math.floor(width / sixteen));
    },
  },

  methods: {
    slidePrevButton() {
      this.$el.querySelector(".swiper").swiper.slidePrev();
    },
  },
});
</script>
<style lang="scss">
@import "@scss/_variables.scss";
.swiper {
  width: 100%;
  height: 100%;
}
.swiper-button-next,
.swiper-button-prev {
  color: $octopus-primary-color !important;
  height: 100%;
  top: 0;
  bottom: 0;
  margin: 0;
}
.swiper-button-next {
  right: 0;
}
.swiper-button-prev {
  left: -35px;
}
.swiper-button-lock {
  display: flex;
}
.swiper-slide {
  display: flex;
  /* justify-content: center; */
  align-items: center;
}
</style>
