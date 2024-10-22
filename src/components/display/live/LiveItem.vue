<template>
  <PodcastItem
    v-if="live && 0 !== live.podcastId"
    :podcast="live"
    :fetch-conference="fetchConference"
  />
</template>

<script lang="ts">
import classicApi from "../../../api/classicApi";
import PodcastItem from "../podcasts/PodcastItem.vue";
import displayMethods from "../../mixins/displayMethods";
import { Podcast } from "@/stores/class/general/podcast";
import { defineComponent } from "vue";
import {
  Conference,
  ConferencePublicInfo,
} from "@/stores/class/conference/conference";
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

  created() {
    this.fetchPodcastData();
    this.watchStatus();
  },
  unmounted() {
    this.clearWatchStatus();
  },
  methods: {
    clearWatchStatus() {
      clearInterval(this.watchInterval as unknown as number);
      this.watchInterval = undefined;
    },
    async fetchPodcastData(): Promise<void> {
      if (!this.fetchConference?.podcastId) return;
      try {
        this.live = await classicApi.fetchData<Podcast>({
          api: 0,
          path: "podcast/" + this.fetchConference.podcastId,
        });
      } catch {
        this.$emit("deleteItem");
        if (this.fetchConference.conferenceId) {
          await classicApi.deleteData({
            api: 9,
            path: "conference/" + this.fetchConference.conferenceId,
          });
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
      const confInfo = await classicApi.fetchData<ConferencePublicInfo>({
        api: 9,
        path: "conference/info/" + this.fetchConference.conferenceId,
      });
      const newStatus = confInfo.status;
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
