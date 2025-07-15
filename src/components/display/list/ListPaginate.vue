<template>
  <div :id="id" class="d-flex flex-column align-items-center">
    <ClassicLoading :loading-text="loadingText" :error-text="errorText" />
    <template v-if="!loading">
      <div
        v-if="!justSizeChosen"
        class="d-flex justify-content-between align-items-center flex-grow-1 w-100"
      >
        <div class="text-secondary me-3">
          <template v-if="textCount">
            {{ textCount }}
          </template>
        </div>
        <PaginateParams
          v-if="!isPhone && !justSizeChosen && totalCount > 0"
          :id="id"
          :rows-per-page="rowsPerPage"
          @update:rows-per-page="changeSize"
        />
      </div>
    </template>
    <slot name="list" />
    <PaginateSection
      v-if="!isPhone && !justSizeChosen && totalCount > 0"
      :id="id"
      :style="playerResponsive ? 'bottom:' + playerStore.playerHeight : ''"
      :first="first"
      :rows-per-page="rowsPerPage"
      :total-count="totalCount"
      :range-size="rangeSize"
      @update:first="changeFirst"
    />
    <button
      v-show="first + rowsPerPage < totalCount && (isPhone || justSizeChosen)"
      :disabled="loading"
      class="btn btn-primary align-self-center w-fit-content m-4"
      :title="t('See more')"
      @click="fetchMore"
    >
      <template v-if="buttonPlus">
        {{ t("See more") }}
      </template>
      <PlusIcon :size="16" :class="buttonPlus ? 'ms-1' : ''" />
    </button>
  </div>
</template>

<script setup lang="ts">
import PlusIcon from "vue-material-design-icons/Plus.vue";
import domHelper from "../../../helper/domHelper";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { state } from "../../../stores/ParamSdkStore";
import PaginateParams from "./PaginateParams.vue";
import PaginateSection from "./PaginateSection.vue";
import {useResizePhone} from "../../composable/useResizePhone";
import { useRouteUpdateParams } from "../../composable/route/useRouteUpdateParams";
import { computed, watch } from "vue";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  first: { default: 0, type: Number },
  rowsPerPage: { default: 30, type: Number },
  totalCount: { default: 0, type: Number },
  textCount: { default: undefined, type: String },
  id: { default: "", type: String },
  loadingText: { default: undefined, type: String },
  errorText: { default: undefined, type: String },
  loading: { default: false, type: Boolean },
  isMobile: { default: false, type: Boolean },
  justSizeChosen: { default: false, type: Boolean },
  playerResponsive: { default: false, type: Boolean },
  forceUpdateParameters: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits(["update:first", "update:rowsPerPage", "update:isMobile"]);

  
//Composables
const { t } = useI18n();
const { isPhone, windowWidth } = useResizePhone();
const { updateRouteParam, updatePaginateSize } = useRouteUpdateParams();
const playerStore = usePlayerStore();


//Computed
const buttonPlus = computed(() => state.generalParameters.buttonPlus);
const rangeSize = computed(() => {
  if (windowWidth.value > 1600) {
    return 3;
  }
  return windowWidth.value > 1530 ? 2 : 1;
});


//Watch
watch(isPhone, () => {emit("update:isMobile", isPhone.value);}, {immediate: true});
watch(()=>props.first,  () => {
  updateRouteParam({pr:(Math.floor(props.first / props.rowsPerPage) + 1).toString()}, props.forceUpdateParameters);
});

//Methods
function fetchMore() {
  emit("update:first", props.first + props.rowsPerPage);
}
function changeFirst(firstValue: number) {
  scrollToTop();
  emit("update:first", firstValue);
}
function changeSize(sizeValue: number) {
  scrollToTop();
  emit("update:rowsPerPage", sizeValue);
  updatePaginateSize(sizeValue, props.forceUpdateParameters);
}
function scrollToTop() {
  const element = document.getElementById(props.id);
  if (!element || element.getBoundingClientRect().top > 0) {
    return;
  }
  const y =
    element.getBoundingClientRect().top +
    window.scrollY -
    domHelper.convertRemToPixels(3.5);
  window.scrollTo({ top: y, behavior: "smooth" });
}
</script>
