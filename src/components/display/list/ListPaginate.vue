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
          :rows-per-page="rowsPerPage"
          @update:rows-per-page="changeSize"
        />
      </div>
    </template>
    <slot name="list" />
    <PaginateSection
      v-if="!isPhone && !justSizeChosen && totalCount > 0"
      :style="playerResponsive ? 'bottom:' + playerHeight : ''"
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
      <PlusIcon :size="16" :class="buttonPlus ? 'ms-1' : ''" />
    </button>
  </div>
</template>

<script lang="ts">
import PlusIcon from "vue-material-design-icons/Plus.vue";
import domHelper from "../../../helper/dom";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { state } from "../../../stores/ParamSdkStore";
import PaginateParams from "./PaginateParams.vue";
import PaginateSection from "./PaginateSection.vue";
import resizePhone from "../../mixins/resizePhone";
import { routeParams } from "../../mixins/routeParam/routeParams";
import { defineComponent } from "vue";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { mapState } from "pinia";
export default defineComponent({
  name: "ListPaginate",
  components: {
    PaginateSection,
    PaginateParams,
    ClassicLoading,
    PlusIcon,
  },
  mixins: [resizePhone, routeParams],
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
    playerResponsive: { default: false, type: Boolean },
  },

  emits: ["update:first", "update:rowsPerPage", "update:isMobile"],
  data() {
    return {
      isPhone: false as boolean,
      windowWidth: 0 as number,
      internSizeChange: false as boolean,
    };
  },
  computed: {
    ...mapState(usePlayerStore, ["playerHeight"]),
    buttonPlus(): boolean {
      return state.generalParameters.buttonPlus as boolean;
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
    first() {
      if (this.internSizeChange) {
        this.internSizeChange = false;
        return;
      }
      this.updatePaginateRank(Math.floor(this.first / this.rowsPerPage) + 1);
    },
  },
  methods: {
    fetchMore() {
      this.$emit("update:first", this.first + this.rowsPerPage);
    },
    changeFirst(firstValue: number) {
      this.scrollToTop();
      this.$emit("update:first", firstValue);
    },
    changeSize(sizeValue: number) {
      this.scrollToTop();
      if (0 !== this.first) {
        this.internSizeChange = true;
      }
      this.$emit("update:rowsPerPage", sizeValue);
      this.updatePaginateSize(sizeValue);
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
