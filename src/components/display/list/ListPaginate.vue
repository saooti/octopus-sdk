<template>
  <div :id="id" class="d-flex flex-column align-items-center">
    <ClassicLoading :loading-text="loadingText" :error-text="errorText" />
    <template v-if="!loading">
      <div
        v-if="!justSizeChosen"
        class="d-flex justify-content-between align-items-center flex-grow-1 w-100"
      >
        <div class="text-secondary">
          <template
            v-if="textCount && (windowWidth > 1300 || windowWidth <= 960)"
          >
            {{ textCount }}
          </template>
        </div>
        <PaginateParams
          v-if="!isPhone && !justSizeChosen && totalCount > 0"
          :rows-per-page="rowsPerPage"
          @update:rows-per-page="changeSize"
        />
      </div>
    </template>
    <slot name="list" />
    <PaginateSection
      v-if="!isPhone && !justSizeChosen && totalCount > 0"
      :first="first"
      :rows-per-page="rowsPerPage"
      :total-count="totalCount"
      :range-size="rangeSize"
      @update:first="changeFirst"
    />
    <button
      v-show="first + rowsPerPage < totalCount && (isPhone || justSizeChosen)"
      :disabled="loading"
      class="btn"
      :class="
        buttonPlus
          ? 'btn-primary align-self-center width-fit-content m-4'
          : 'btn-more'
      "
      :title="$t('See more')"
      @click="fetchMore"
    >
      <template v-if="buttonPlus">
        {{ $t("See more") }}
      </template>
      <div :class="buttonPlus ? 'ms-1' : ''" class="saooti-more" />
    </button>
  </div>
</template>

<script lang="ts">
import domHelper from "../../../helper/dom";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { state } from "../../../stores/ParamSdkStore";
import PaginateParams from "./PaginateParams.vue";
import PaginateSection from "./PaginateSection.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "ListPaginate",
  components: {
    PaginateSection,
    PaginateParams,
    ClassicLoading,
  },
  props: {
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
  },

  emits: ["update:first", "update:rowsPerPage", "update:isMobile"],
  data() {
    return {
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    buttonPlus(): boolean {
      return state.generalParameters.buttonPlus as boolean;
    },
    isPhone() {
      return 960 >= this.windowWidth;
    },
    rangeSize() {
      if (this.windowWidth > 1600) {
        return 3;
      }
      return this.windowWidth > 1530 ? 2 : 1;
    },
  },
  watch: {
    isPhone: {
      immediate: true,
      handler() {
        this.$emit("update:isMobile", this.isPhone);
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener("resize", this.onResize);
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },
    fetchMore() {
      this.$emit("update:first", this.first + this.rowsPerPage);
    },
    changeFirst(firstValue: number) {
      this.scrollToTop();
      this.$emit("update:first", firstValue);
    },
    changeSize(sizeValue: number) {
      this.scrollToTop();
      this.$emit("update:rowsPerPage", sizeValue);
    },
    scrollToTop() {
      const element = document.getElementById(this.id);
      if (!element || element.getBoundingClientRect().top > 0) {
        return;
      }
      const y =
        element.getBoundingClientRect().top +
        window.scrollY -
        domHelper.convertRemToPixels(3.5);
      window.scrollTo({ top: y, behavior: "smooth" });
    },
  },
});
</script>
