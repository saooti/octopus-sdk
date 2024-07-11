<template>
  <div class="paginate-fixed" :style="'bottom:' + playerHeight">
    <div class="mx-2">
      {{ $t("Showing items number", { page: page + 1, totalPage: totalPage }) }}
    </div>
    <div class="d-flex flex-nowrap">
      <button
        v-for="paginateButton in buttonsLeft"
        :key="paginateButton.title"
        class="btn"
        :title="paginateButton.title"
        :disabled="paginateButton.disabled"
        @click="paginateButton.action"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path fill-rule="evenodd" :d="paginateButton.path" />
        </svg>
      </button>
      <div v-for="pageNumber in pagination" :key="pageNumber">
        <span v-if="null === pageNumber" class="btn btn-min-width"> ... </span>
        <button
          v-else
          class="btn btn-min-width"
          :class="{ active: page === pageNumber - 1 }"
          @click="changeFirst((pageNumber - 1) * rowsPerPage)"
        >
          {{ pageNumber }}
        </button>
      </div>
      <button
        v-for="paginateButton in buttonsRight"
        :key="paginateButton.title"
        class="btn btn-min-width"
        :title="paginateButton.title"
        :disabled="paginateButton.disabled"
        @click="paginateButton.action"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path fill-rule="evenodd" :d="paginateButton.path" />
        </svg>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PaginateSection",

  props: {
    totalCount: { default: 0, type: Number },
    first: { default: 0, type: Number },
    rowsPerPage: { default: 0, type: Number },
    rangeSize: { default: 1, type: Number },
  },

  emits: ["update:first"],

  computed: {
    ...mapState(usePlayerStore, ["playerHeight"]),
    buttonsLeft() {
      return [
        {
          title: this.$t("Go to first page"),
          disabled: 0 === this.first,
          action: () => {
            this.changeFirst(0);
          },
          path: "M11.854 3.646a.5.5 0 0 1 0 .708L8.207 8l3.647 3.646a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708 0zM4.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-.5-.5z",
        },
        {
          title: this.$t("Go to previous page"),
          disabled: 0 === this.first,
          action: () => {
            this.changeFirst(this.first - this.rowsPerPage);
          },
          path: "M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z",
        },
      ];
    },
    buttonsRight() {
      return [
        {
          title: this.$t("Go to next page"),
          disabled: this.lastFirst === this.first,
          action: () => {
            this.changeFirst(this.first + this.rowsPerPage);
          },
          path: "M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z",
        },
        {
          title: this.$t("Go to last page"),
          disabled: this.lastFirst === this.first,
          action: () => {
            this.changeFirst(this.lastFirst);
          },
          path: "M4.146 3.646a.5.5 0 0 0 0 .708L7.793 8l-3.647 3.646a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708 0zM11.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5z",
        },
      ];
    },
    page() {
      return Math.floor(this.first / this.rowsPerPage);
    },
    totalPage() {
      return Math.ceil(this.totalCount / this.rowsPerPage);
    },
    pagination(): (number | null)[] {
      if (-1 === this.rangeSize) {
        return [];
      }
      const minPaginationElems = 5 + this.rangeSize * 2;
      let rangeStart =
        this.totalPage <= minPaginationElems
          ? 1
          : this.page + 1 - this.rangeSize;
      let rangeEnd =
        this.totalPage <= minPaginationElems
          ? this.totalPage
          : this.page + 1 + this.rangeSize;
      rangeEnd = rangeEnd > this.totalPage ? this.totalPage : rangeEnd;
      rangeStart = rangeStart < 1 ? 1 : rangeStart;
      if (this.totalPage > minPaginationElems) {
        return this.getPaginationArrayWithEllipsis(
          rangeStart,
          rangeEnd,
          minPaginationElems,
        );
      }
      const res = [];
      for (let i = rangeStart; i <= rangeEnd; i++) {
        res.push(i);
      }
      return res;
    },
    lastFirst(): number {
      return (this.totalPage - 1) * this.rowsPerPage;
    },
  },

  methods: {
    getPaginationArrayWithEllipsis(
      rangeStart: number,
      rangeEnd: number,
      minPaginationElems: number,
    ) {
      const res = [];
      const isStartBoundaryReached = rangeStart - 1 < 3;
      const isEndBoundaryReached = this.totalPage - rangeEnd < 3;
      if (isStartBoundaryReached) {
        rangeEnd = minPaginationElems - 2;
        for (let i = 1; i < rangeStart; i++) {
          res.push(i);
        }
      } else {
        res.push(1);
        res.push(null);
      }
      if (isEndBoundaryReached) {
        rangeStart = this.totalPage - (minPaginationElems - 3);
        for (let i = rangeStart; i <= this.totalPage; i++) {
          res.push(i);
        }
      } else {
        for (let i = rangeStart; i <= rangeEnd; i++) {
          res.push(i);
        }
        res.push(null);
        res.push(this.totalPage);
      }
      return res;
    },
    changeFirst(newFirst: number) {
      this.$emit("update:first", newFirst);
    },
  },
});
</script>
<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app .paginate-fixed {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  position: sticky;
  background: $octopus-background;
  padding: 0.5rem 0;
  z-index: 10;
  .btn {
    border-radius: 0;
    &.active {
      background: $primaryColorMoreTransparent;
    }
  }
}
</style>
