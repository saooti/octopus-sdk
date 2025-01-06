<template>
  <section class="page-box">
    <h1>{{ title }}</h1>
    <PodcastList
      :first="firstRoute"
      :size="sizeRoute"
      :rubrique-id="rubriqueId"
    />
  </section>
</template>

<script lang="ts">
import classicApi from "../../api/classicApi";
import PodcastList from "../display/podcasts/PodcastList.vue";
import { defineComponent } from "vue";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { useGeneralStore } from "../../stores/GeneralStore";
import { mapState } from "pinia";
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
  computed:{
    ...mapState(useGeneralStore, ["metaTitle"]),
  },
  watch: {
    rubriqueId: {
      immediate: true,
      async handler() {
        const data = await classicApi.fetchData<Rubrique>({
          api: 0,
          path: "rubrique/" + this.rubriqueId,
        });
        this.title = data.name;
        document.title = this.title + ' - ' + this.metaTitle;
      },
    },
  },
});
</script>
