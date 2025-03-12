<template>
  <div class="position-relative w-100">
    <template v-if="!isPhone">
      <swiper
        :key="manualReload"
        :slides-per-view="numberItem"
        :space-between="0"
        :loop="true"
        :slides-offset-before="offsetSwiper"
        :slides-offset-after="offsetSwiper"
        :navigation="true"
        :modules="modules"
        @slides-updated="slidesUpdated"
        @slide-change="slideChange"
      >
        <swiper-slide v-for="(obj, index) in listObject" :key="obj">
          <slot name="octopusSlide" :option="obj" :index="index" v-if="composableInit" />
        </swiper-slide>
      </swiper>
    </template>
    <div v-else-if="composableInit" class="element-list-inline">
      <div v-for="(obj, index) in listObject" :key="obj" class="element-list-item">
        <slot name="octopusSlide" :option="obj" :index="index" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import domHelper from "../../../helper/domHelper";
import { state } from "../../../stores/ParamSdkStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {useResizePhone} from "../../composable/useResizePhone";
import { defineComponent } from "vue";
export default defineComponent({
  name: "SwiperList",

  components: {
    Swiper,
    SwiperSlide,
  },

  props: {
    listObject: { default: () => [], type: Array as () => Array<unknown> },
    sizeItemOverload: { default: undefined, type: Number },
  },
  setup(){
    const { isPhone, windowWidth } = useResizePhone();
    return { isPhone, windowWidth }
  },

  data() {
    return {
      manualReload: 0 as number,
      modules: [Navigation],
      numberItem: 5 as number,
      offsetSwiper: 40 as number,
      widthSwiperUsable: 0 as number,
      itemSizeWithoutRecalculed: 0 as number,
      composableInit: false as boolean,
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
    /* isLoop(): boolean {
      return this.listObject.length >= this.numberItem;
    }, */
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
    listObject: {
      deep: true,
      handler() {
        this.manualReload += 1;
      },
    },
  },
  mounted(){
    this.$nextTick(() => {
      this.composableInit = true;
    });
  },

  methods: {
    slidesUpdated() {
      if (!this.$el) return;
      const slides = this.$el.getElementsByClassName("swiper-slide");
      for (const slide of slides) {
        slide.style.width = this.itemRecalculizedSize + "px";
      }
    },
    slideChange() {
      if (!this.$el) return;
      const wrapper = this.$el.getElementsByClassName("swiper-wrapper")[0];
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

:root {
  --swiper-navigation-sides-offset: 0;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-button-next,
.swiper-button-prev {
  color: var(--octopus-primary) !important;
  height: 100%;
  inset-block:0;
  margin: 0;
  width: 40px;
  background: var(--octopus-background);
}

.swiper-button-lock {
  display: flex;
}

.swiper-slide {
  display: flex !important;
  align-items: center;
  justify-content: center;
}
</style>
