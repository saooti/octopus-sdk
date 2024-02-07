<template>
  <div class="position-relative w-100">
    <template v-if="!isPhone">
      <button
        v-show="isLoop"
        :title="$t('Display previous')"
        class="btn-transparent swiper-button-prev"
        @click="slidePrevButton()"
      ></button>
      <swiper
        :slides-per-view="numberItem"
        :space-between="0"
        :loop="isLoop"
        :slides-offset-before="offsetSwiper"
        :slides-offset-after="offsetSwiper"
        :navigation="true"
        :modules="modules"
        @slides-updated="slidesUpdated"
        @slide-change="slideChange"
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
      offsetSwiper: 40 as number,
      widthSwiperUsable: 0 as number,
      itemSizeWithoutRecalculed: 0 as number,
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
    itemRecalculizedSize(): number {
      return this.widthSwiperUsable / this.numberItem;
    },
  },
  watch: {
    windowWidth() {
      if (!this.$el) return;
      this.widthSwiperUsable =
        (this.$el as HTMLElement).offsetWidth - this.offsetSwiper * 2;
      const sixteen = domHelper.convertRemToPixels(this.sizeItem + 0.5);
      this.numberItem = Math.max(
        1,
        Math.floor(this.widthSwiperUsable / sixteen),
      );
      this.itemSizeWithoutRecalculed =
        (this.$el as HTMLElement).offsetWidth / this.numberItem;
    },
  },

  methods: {
    slidesUpdated() {
      //TODO CODE USELESS IF LIBRARY IS FIXED BUT FOR NOW IT IS IMPORTANT
      if (!this.$el) return;
      let slides = this.$el.getElementsByClassName("swiper-slide");
      for (let slide of slides) {
        slide.style.width = this.itemRecalculizedSize + "px";
      }
    },
    slideChange() {
      if (!this.$el) return;
      let wrapper = this.$el.getElementsByClassName("swiper-wrapper")[0];
      if (wrapper.style.transform.includes("translate3d(40px")) {
        return;
      }
      const matches = /^^translate3d\((-*\d+\.*\d*)px/.exec(
        wrapper.style.transform,
      );
      if (!matches || matches.length <= 1) {
        return;
      }
      const transformPixel = parseFloat(matches[1]) - this.offsetSwiper;
      const nbTransformItems = Math.round(
        transformPixel / this.itemSizeWithoutRecalculed,
      );
      wrapper.style.transform =
        "translate3d(" +
        (nbTransformItems * this.itemRecalculizedSize + this.offsetSwiper) +
        "px, 0px, 0px)";
    },
    slidePrevButton() {
      this.$el.querySelector(".swiper").swiper.slidePrev();
    },
  },
});
</script>
<style lang="scss">
@import "@scss/_variables.scss";
:root {
  --swiper-navigation-sides-offset: 0;
}
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
  width: 40px;
  background: $octopus-background;
}
.swiper-button-lock {
  display: flex;
}
.swiper-slide {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
