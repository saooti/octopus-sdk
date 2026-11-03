<template>
    <div
        ref="root"
        class="position-relative w-100"
        :role="regionLabel ? 'region' : undefined"
        :aria-label="regionLabel"
        :aria-roledescription="regionLabel ? $t('SwiperList - Role') : undefined"
    >
        <template v-if="!isPhone">
            <!--
                Not rendered when not looping, as navigation is disabled.
                Before the slides: reached first by keyboard and screen readers
            -->
            <template v-if="loop">
                <!-- Own icons: Swiper's are identical and only flipped with CSS -->
                <button
                    :id="prevElId"
                    type="button"
                    class="swiper-button-prev"
                    :aria-label="$t('SwiperList - Show previous items')"
                    :aria-controls="swiperId"
                >
                    <ChevronLeftIcon class="swiper-arrow-icon" aria-hidden="true" />
                </button>
                <button
                    :id="nextElId"
                    type="button"
                    class="swiper-button-next"
                    :aria-label="$t('SwiperList - Show next items')"
                    :aria-controls="swiperId"
                >
                    <ChevronRightIcon class="swiper-arrow-icon" aria-hidden="true" />
                </button>
            </template>
            <swiper
                :id="swiperId"
                :key="manualReload"
                :slides-per-view="numberItem"
                :space-between="gapPx"
                :loop="loop"
                :slides-offset-before="offsetSwiper"
                :slides-offset-after="offsetSwiper"
                :allow-slide-next="loop"
                :allow-slide-prev="loop"
                :navigation="navigationOptions"
                :modules="modules"
                wrapper-tag="ul"
                @slides-updated="slidesUpdated"
                @slide-change="slideChange"
            >
                <!--
                    Position kept when looping reorders the slides, and hidden
                    slides out of the tab order and accessibility tree
                -->
                <swiper-slide
                    v-for="(obj, index) in listObject"
                    :key="index"
                    tag="li"
                    :aria-posinset="index + 1"
                    :aria-setsize="listObject.length"
                    :inert="!isVisible(index)"
                >
                    <slot
                        v-if="composableInit"
                        name="octopusSlide"
                        :option="obj"
                        :index="index"
                    />
                </swiper-slide>
            </swiper>
            <p
                v-if="loop"
                class="visually-hidden"
                role="status"
            >
                {{ statusText }}
            </p>
        </template>
        <ul v-else-if="composableInit" class="element-list-inline">
            <li
                v-for="(obj, index) in listObject"
                :key="obj"
                class="element-list-item"
            >
                <slot
                    name="octopusSlide"
                    :option="obj"
                    :index="index"
                />
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import domHelper from "../../../helper/domHelper";
import { state } from "../../../stores/ParamSdkStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useI18n } from "vue-i18n";
import ChevronLeftIcon from "vue-material-design-icons/ChevronLeft.vue";
import ChevronRightIcon from "vue-material-design-icons/ChevronRight.vue";
import "swiper/css";
import "swiper/css/navigation";
import {useResizePhone} from "../../composable/useResizePhone";
import { computed, getCurrentInstance, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";

//Props 
interface BaseProps {
    /** Elements to display */
    listObject?: Array<unknown>;
    /** Name of the list (usually the section title), exposes it as a carousel region */
    label?: string;
}
type Props = BaseProps & (
    | {
        /** Size, in **rem**, of the items */
        sizeItemOverload?: number;
        itemCount?: never;
    }
    | {
        /** Number of items shown at once (overrides item size) */
        itemCount: number;
        sizeItemOverload?: never;
    }
);
const props = withDefaults(defineProps<Props>(), {
    listObject: () => []
});
 
//Data
const gapPx = 10;
const manualReload = ref(0);
const numberItem = ref(5);
const offsetSwiper = ref(0);
const widthSwiperUsable = ref(0);
const itemSizeWithoutRecalculed = ref(0);
const composableInit = ref(false);
/** Index, in listObject, of the first visible item */
const realIndex = ref(0);
/** Whether the visible items changed since the swiper was created */
const hasSlid = ref(false);
const rootRef = useTemplateRef('root');


//Composables
const { isPhone, windowWidth } = useResizePhone();
const { t } = useI18n();


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

const itemRecalculizedSize = computed(() => {
    const totalGap = gapPx * Math.max(numberItem.value - 1, 0);
    return (widthSwiperUsable.value - totalGap) / numberItem.value;
});

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

const uid = computed((): number => {
    const instance = getCurrentInstance();
    return instance.uid;
});
const swiperId = computed((): string => 'swiper-list-' + uid.value);
const regionLabel = computed((): string | undefined => (!isPhone.value && props.label) || undefined);
/** Visible items announced after each change, not on load */
const statusText = computed((): string => {
    if (!hasSlid.value) {
        return '';
    }
    const count = props.listObject.length;
    return t('SwiperList - Visible items', {
        first: realIndex.value + 1,
        last: ((realIndex.value + numberItem.value - 1) % count) + 1,
        count
    });
});
const prevElId = computed((): string => 'swiper-button-prev-' + uid.value);
const nextElId = computed((): string => 'swiper-button-next-' + uid.value);
const navigationOptions = computed(() => ({
    prevEl: '#' + prevElId.value,
    nextEl: '#' + nextElId.value,
    addIcons: false
}));

//Watch
watch([windowWidth, () => props.itemCount], () => onWindowResize());
watch(()=>props.listObject, () => {
    manualReload.value += 1;
    realIndex.value = 0;
    hasSlid.value = false;
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
    if (!el) {return;}
    widthSwiperUsable.value =el.offsetWidth - offsetSwiper.value * 2;
    if (props.itemCount) {
        numberItem.value = Math.max(1, props.itemCount);
    } else {
        const itemSizePx = domHelper.convertRemToPixels(sizeItem.value + 0.5);
        numberItem.value = Math.max(
            1,
            Math.floor((widthSwiperUsable.value + gapPx) / (itemSizePx + gapPx)),
        );
    }
    itemSizeWithoutRecalculed.value =el.offsetWidth / numberItem.value;
}
function slidesUpdated() {
    const el = rootRef?.value as HTMLElement;
    if (!el) {return;}
    const slides = el.getElementsByClassName("swiper-slide") as Array<HTMLElement>;
    for (const slide of slides) {
        slide.style.width = itemRecalculizedSize.value + "px";
    }
}
/** Whether the item at `index` in listObject is shown */
function isVisible(index: number): boolean {
    const count = props.listObject.length;
    return !loop.value || (index - realIndex.value + count) % count < numberItem.value;
}
function slideChange(swiper: SwiperType) {
    realIndex.value = swiper.realIndex;
    hasSlid.value = true;
    const el = rootRef?.value as HTMLElement;
    if (!el) {return;}
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
        (nbTransformItems * (itemRecalculizedSize.value + gapPx) + offsetSwiper.value) +
        "px, 0px, 0px)";
}
</script>

<style lang="scss">
:root {
  --swiper-navigation-sides-offset: -50px;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-button-next,
.swiper-button-prev {
  color: var(--octopus-swiper-arrow-color) !important;
  //height: 100%;
  inset-block:0;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  width: 40px;
  z-index: 5 !important;
  //background: var(--octopus-background);

  // Icon fills the button, Swiper's CSS sizes the svg inside it
  .swiper-arrow-icon {
    display: flex;
    width: 100%;
    height: 100%;
  }
}

// Remove default list style, padding-bottom of .element-list-inline is kept
ul.swiper-wrapper,
ul.element-list-inline {
  list-style: none;
  margin: 0;
  padding-inline-start: 0;
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
