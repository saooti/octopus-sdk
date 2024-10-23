<template>
  <ClassicRadio
    v-model:text-init="sort"
    id-radio="sort-radio"
    :options="optionsArray"
  />
</template>

<script lang="ts">
import ClassicRadio from "../../form/ClassicRadio.vue";
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    ClassicRadio,
  },
  props: {
    isEmission: { default: false, type: Boolean },
    sortCriteria: { default: "DATE", type: String },
  },

  emits: ["updateSortCriteria"],
  data() {
    return {
      sort: this.sortCriteria,
    };
  },
  computed: {
    optionsArray() {
      let options = [
        { title: this.$t("Sort score"), value: "SCORE" },
        {
          title: this.$t("Sort last"),
          value: this.isEmission ? "LAST_PODCAST_DESC" : "DATE",
        },
        { title: this.$t("Sort name"), value: "NAME" },
      ];
      if (!this.isEmission) {
        options.splice(2, 0, {
          title: this.$t("Chronological"),
          value: "DATE_ASC",
        });
      }
      return options;
    },
  },
  watch: {
    sort(): void {
      this.$emit("updateSortCriteria", this.sort);
    },
    sortCriteria(): void {
      this.sort = this.sortCriteria;
    },
  },
});
</script>
