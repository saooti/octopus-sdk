<template>
  <ClassicRadio
    v-model:textInit="sort"
    id-radio="sort-radio"
    :options="[
      { title: $t('Sort score'), value: 'SCORE' },
      {
        title: $t('Sort last'),
        value: isEmission ? 'LAST_PODCAST_DESC' : 'DATE',
      },
      { title: $t('Sort name'), value: 'NAME' },
    ]"
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
