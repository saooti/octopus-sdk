<template>
  <div class="d-flex flex-column">
    <div class="text-primary mb-2">
      {{ $t("Sort") }}
    </div>
    <ClassicRadio
      :text-init="sort"
      id-radio="sort-radio"
      :options="optionsArray"
      @update:text-init="$emit('update:sort', $event)"
    />
  </div>
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
    sort: { default: "DATE", type: String },
  },

  emits: ["update:sort"],
  data() {
    return {};
  },
  computed: {
    optionsArray() {
      const options = [
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
});
</script>
