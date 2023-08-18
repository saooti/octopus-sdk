<template>
  <PodcastItem
    v-if="live && 0 !== live.podcastId"
    :podcast="live"
    :fetch-conference="fetchConference"
  />
</template>

<script lang="ts">
import octopusApi from "@saooti/octopus-api";
import PodcastItem from "../podcasts/PodcastItem.vue";
import crudApi from "@/api/classicCrud";
import displayMethods from "../../mixins/displayMethods";
import { Podcast } from "@/stores/class/general/podcast";
import { defineComponent } from "vue";
import { Conference } from "@/stores/class/conference/conference";
export default defineComponent({
  name: "LiveItem",

  components: {
    PodcastItem,
  },
  mixins: [displayMethods],
  props: {
    fetchConference: { default: undefined, type: Object as () => Conference },
  },
  emits: ["deleteItem", "updateItem"],

  data() {
    return {
      live: undefined as Podcast | undefined,
      watchInterval: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },

  async created() {
    this.fetchPodcastData();
    this.watchStatus();
  },
  unmounted() {
    this.clearWatchStatus();
  },
  methods: {
    clearWatchStatus(){
      clearInterval(this.watchInterval as unknown as number);
      this.watchInterval = undefined;
    },
    async fetchPodcastData(): Promise<void> {
      if (!this.fetchConference || !this.fetchConference.podcastId) return;
      try {
        this.live = await octopusApi.fetchData<Podcast>(
          0,
          "podcast/" + this.fetchConference.podcastId,
        );
      } catch {
        this.$emit("deleteItem");
        if (this.fetchConference.conferenceId) {
          await crudApi.deleteData(
            9,
            "conference/" + this.fetchConference.conferenceId,
          );
        }
      }
    },
    async watchStatus(): Promise<void> {
      if (
        !this.fetchConference ||
        ("PLANNED" !== this.fetchConference.status &&
          "PENDING" !== this.fetchConference.status &&
          "RECORDING" !== this.fetchConference.status)
      ) {
        return;
      }
      const newStatus = await octopusApi.fetchData<string>(
        9,
        "conference/realstatus/" + this.fetchConference.conferenceId,
      );
      if (newStatus !== this.fetchConference.status) {
        this.$emit("updateItem", {
          ...this.fetchConference,
          ...{ status: newStatus },
        });
      } else {
        this.clearWatchStatus();
        this.watchInterval = setTimeout(() => {
          this.watchStatus();
        }, 5000);
      }
    },
  },
});
</script>
