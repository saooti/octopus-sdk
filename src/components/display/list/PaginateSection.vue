<template>
  <div class="paginate-fixed">
    <div class="mx-2">
      {{ t("Showing items number", { page: page + 1, totalPage: totalPage }) }}
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
      <template v-for="pageNumber in pagination" :key="pageNumber">
        <span v-if="null === pageNumber" class="btn btn-min-width"> ... </span>
        <button
          v-else
          class="btn btn-min-width"
          :class="{ active: page === pageNumber - 1 }"
          @click="changeFirst((pageNumber - 1) * rowsPerPage)"
        >
          {{ pageNumber }}
        </button>
      </template>
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
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  totalCount: { default: 0, type: Number },
  first: { default: 0, type: Number },
  rowsPerPage: { default: 0, type: Number },
  rangeSize: { default: 1, type: Number },
})


//Emits
const emit = defineEmits(["update:first"]);

//Composables
const { t } = useI18n();

//Computed
const buttonsLeft = computed(() => {
  return [
    {
      title: t("Go to first page"),
      disabled: 0 === props.first,
      action: () => {changeFirst(0);},
      path: "M11.854 3.646a.5.5 0 0 1 0 .708L8.207 8l3.647 3.646a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708 0zM4.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-.5-.5z",
    },
    {
      title: t("Go to previous page"),
      disabled: 0 === props.first,
      action: () => {changeFirst(props.first - props.rowsPerPage);},
      path: "M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z",
    },
  ];
});
const buttonsRight = computed(() => {
  return [
    {
      title: t("Go to next page"),
      disabled: lastFirst.value === props.first,
      action: () => {changeFirst(props.first + props.rowsPerPage);},
      path: "M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z",
    },
    {
      title: t("Go to last page"),
      disabled: lastFirst.value === props.first,
      action: () => {changeFirst(lastFirst.value);},
      path: "M4.146 3.646a.5.5 0 0 0 0 .708L7.793 8l-3.647 3.646a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708 0zM11.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5z",
    },
  ];
});
const page = computed(() =>Math.floor(props.first / props.rowsPerPage));
const totalPage = computed(() =>Math.ceil(props.totalCount / props.rowsPerPage));
const pagination = computed(() => {
  if (-1 === props.rangeSize) {
    return [];
  }
  const minPaginationElems = 5 + props.rangeSize * 2;
  let rangeStart =
    totalPage.value <= minPaginationElems
      ? 1
      : page.value + 1 - props.rangeSize;
  let rangeEnd =
    totalPage.value <= minPaginationElems
      ? totalPage.value
      : page.value + 1 + props.rangeSize;
  rangeEnd = rangeEnd > totalPage.value ? totalPage.value : rangeEnd;
  rangeStart = rangeStart < 1 ? 1 : rangeStart;
  if (totalPage.value > minPaginationElems) {
    return getPaginationArrayWithEllipsis(
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
});
const lastFirst = computed(() =>(totalPage.value - 1) * props.rowsPerPage);


//Methods
function getPaginationArrayWithEllipsis(
  rangeStart: number,
  rangeEnd: number,
  minPaginationElems: number,
) {
  const res = [];
  const isStartBoundaryReached = rangeStart - 1 < 3;
  const isEndBoundaryReached = totalPage.value - rangeEnd < 3;
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
    rangeStart = totalPage.value - (minPaginationElems - 3);
    for (let i = rangeStart; i <= totalPage.value; i++) {
      res.push(i);
    }
  } else {
    for (let i = rangeStart; i <= rangeEnd; i++) {
      res.push(i);
    }
    res.push(null);
    res.push(totalPage.value);
  }
  return res;
}
function changeFirst(newFirst: number) {
  emit("update:first", newFirst);
}
</script>
<style lang="scss">

.octopus-app {
  .paginate-fixed {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    position: sticky;
    background: var(--octopus-background);
    padding: 0.5rem 0;
    z-index: 10;

    .btn {
      border-radius: 0;

      &.active {
        background: var(--octopus-primary-more-transparent);
      }
    }
  }
  
  .module-box .paginate-fixed,
  .octopus-modal .paginate-fixed,
  .octopus-accordion .paginate-fixed {
    bottom: 0 !important;
  }

}
</style>
