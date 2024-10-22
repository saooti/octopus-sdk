<template>
  <div class="paginate">
    <div class="d-flex align-items-center justify-content-center">
      <label for="rows-per-page-select">{{ $t("Items per page :") }}</label>
      <select
        id="rows-per-page-select"
        :value="rowsPerPage"
        class="c-hand p-1 mx-2"
        @change="$emit('update:rowsPerPage', parseInt($event.target.value, 10))"
      >
        <option
          v-for="option in optionsRowsPerPage"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "PaginateParams",

  props: {
    rowsPerPage: { default: 0, type: Number },
  },

  emits: ["update:rowsPerPage"],

  data() {
    return {
      optionsRowsPerPage: [10, 20, 30, 40, 50, 60] as Array<number>,
    };
  },
  created() {
    this.initRowsPerPage();
  },

  methods: {
    initRowsPerPage() {
      if (this.optionsRowsPerPage.includes(this.rowsPerPage)) {
        return;
      }
      this.optionsRowsPerPage.push(this.rowsPerPage);
      this.optionsRowsPerPage.sort((a, b) => a - b);
    },
  },
});
</script>
<style lang="scss">
.octopus-app .paginate {
  display: flex;
  justify-content: flex-end;
  select {
    border-top: 0;
    border-right: 0;
    border-left: 0;
    background: transparent !important;
  }
}
</style>
