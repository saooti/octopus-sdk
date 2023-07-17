<template>
  <div class="page-box">
    <h1>{{ title }}</h1>
    <PodcastList
      :first="firstRoute"
      :size="sizeRoute"
      :rubrique-id="rubriqueId"
    />
  </div>
</template>

<script lang="ts">
import octopusApi from "@saooti/octopus-api";
import PodcastList from "../display/podcasts/PodcastList.vue";
import { defineComponent } from "vue";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
export default defineComponent({
  name: "RubriquePage",
  components: {
    PodcastList,
  },
  props: {
    firstRoute: { default: 0, type: Number },
    sizeRoute: { default: 30, type: Number },
    rubriqueId: { default: undefined, type: [Number] },
  },
  data() {
    return {
      title: "" as string,
    };
  },
  watch: {
    rubriqueId: {
      immediate: true,
      async handler() {
        const data = await octopusApi.fetchData<Rubrique>(
          0,
          "rubrique/" + this.rubriqueId,
        );
        this.title = data.name;
      },
    },
  },
});
</script>
