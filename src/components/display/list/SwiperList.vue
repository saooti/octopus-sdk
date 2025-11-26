<template>
  <div ref="root" class="position-relative w-100">
    <template v-if="!isPhone">
      <swiper
        :key="manualReload"
        :slides-per-view="numberItem"
        :space-between="0"
        :loop="loop"
        :slides-offset-before="offsetSwiper"
        :slides-offset-after="offsetSwiper"
        :allow-slide-next="loop"
        :allow-slide-prev="loop"
        :navigation="true"
        :modules="modules"
        @slides-updated="slidesUpdated"
        @slide-change="slideChange"
      >
        <swiper-slide v-for="(obj, index) in listObject" :key="obj">
          <slot v-if="composableInit" name="octopusSlide" :option="obj" :index="index" />
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

<script setup lang="ts">
import domHelper from "../../../helper/domHelper";
import { state } from "../../../stores/ParamSdkStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {useResizePhone} from "../../composable/useResizePhone";
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";

//Props 
const props = defineProps({
  listObject: { default: () => [], type: Array as () => Array<unknown> },
  /** Size, in **rem**, of the emission items */
  sizeItemOverload: { default: undefined, type: Number },
})
 
//Data 
const manualReload = ref(0);
const numberItem = ref(5);
const offsetSwiper = ref(40);
const widthSwiperUsable = ref(0);
const itemSizeWithoutRecalculed = ref(0);
const composableInit = ref(false);
const rootRef = useTemplateRef('root');


//Composables
const { isPhone, windowWidth } = useResizePhone();


//Computed
const sizeItem = computed(() => {
  if (props.sizeItemOverload) {
    return props.sizeItemOverload;
  }
  if (windowWidth.value <= 450) {
    return 12.5;
  }
  return state.generalParameters.podcastItem
    ? state.generalParameters.podcastItem
    : 13.5;
});
const itemRecalculizedSize = computed(() => widthSwiperUsable.value / numberItem.value);

/** Indicates that the swiper should loop */
const loop = computed((): boolean => {
  return (props.listObject.length > numberItem.value);
});

const modules = computed(() => {
  if (loop.value === true) {
    return [Navigation];
  } else {
    return [];
  }
});

//Watch
watch(windowWidth, () => onWindowResize());
watch(()=>props.listObject, () => {
  manualReload.value += 1;
}, {deep:true});


onMounted(()=>{
  nextTick(() => {
    onWindowResize();
    composableInit.value = true;
  });
})


//Methods
function onWindowResize(){
  const el = rootRef?.value as HTMLElement;
  if (!el) return;
  widthSwiperUsable.value =el.offsetWidth - offsetSwiper.value * 2;
  const sixteen = domHelper.convertRemToPixels(sizeItem.value + 0.5);
  numberItem.value = Math.max(
    1,
    Math.floor(widthSwiperUsable.value / sixteen),
  );
  itemSizeWithoutRecalculed.value =el.offsetWidth / numberItem.value;
}
function slidesUpdated() {
  const el = rootRef?.value as HTMLElement;
  if (!el) return;
  const slides = el.getElementsByClassName("swiper-slide") as Array<HTMLElement>;
  for (const slide of slides) {
    slide.style.width = itemRecalculizedSize.value + "px";
  }
}
function slideChange() {
  const el = rootRef?.value as HTMLElement;
  if (!el) return;
  const wrapper = el.getElementsByClassName("swiper-wrapper")[0] as HTMLElement;
  if (wrapper.style.transform.includes("translate3d(40px")) {
    return;
  }
  const matches = /^^translate3d\((-*\d+\.*\d*)px/.exec(
    wrapper.style.transform,
  );
  if (!matches || matches.length <= 1) {
    return;
  }
  const transformPixel = parseFloat(matches[1]) - offsetSwiper.value;
  const nbTransformItems = Math.round(
    transformPixel / itemSizeWithoutRecalculed.value,
  );
  wrapper.style.transform =
    "translate3d(" +
    (nbTransformItems * itemRecalculizedSize.value + offsetSwiper.value) +
    "px, 0px, 0px)";
}

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
