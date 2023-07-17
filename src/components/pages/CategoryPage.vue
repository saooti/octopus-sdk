<template>
  <div class="page-box">
    <h1>{{ title }}</h1>
    <PodcastList
      :first="0"
      :size="30"
      :iab-id="iabId"
      :organisation-id="orgaArray"
    />
  </div>
</template>

<script lang="ts">
import PodcastList from "../display/podcasts/PodcastList.vue";
import { useFilterStore } from "@/stores/FilterStore";
import { useGeneralStore } from "@/stores/GeneralStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { Category } from "@/stores/class/general/category";
export default defineComponent({
  components: {
    PodcastList,
  },
  props: {
    iabId: { default: undefined, type: Number },
  },

  computed: {
    ...mapState(useGeneralStore, ["storedCategories"]),
    ...mapState(useFilterStore, ["filterOrgaId"]),
    orgaArray(): Array<string> {
      return this.filterOrgaId ? [this.filterOrgaId] : [];
    },
    title(): string {
      const matchCategories = this.storedCategories.filter(
        (c: Category) => c.id === this.iabId,
      );
      if (1 !== matchCategories.length) return "";
      return matchCategories[0]["name"];
    },
  },
});
</script>
