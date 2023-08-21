<template>
  <div v-if="playerRadioHistory.length" class="d-flex align-items-center mt-3">
    <div class="fw-bold me-3">
      {{ $t("Previously") + ":" }}
    </div>
    <button
      v-if="indexStart !== 0"
      class="btn btn-transparent text-light saooti-left"
      @click="handleResize(0)"
    />
    <div ref="historyListContainer" class="history-list-container">
      <div
        v-for="(pastItem, index) in playerRadioHistory"
        :key="pastItem.title"
        :ref="'history' + index"
        class="d-flex flex-shrink-0"
      >
        <div class="d-flex flex-shrink-0 align-items-end">
          <span class="me-2 hour-past-item">{{
            displayTimeItem(pastItem)
          }}</span>
          <span class="me-3">{{ displayPreviousItem(pastItem) }}</span>
        </div>
      </div>
    </div>
    <button
      v-if="indexNotDisplay <= playerRadioHistory.length - 1"
      class="btn btn-transparent text-light saooti-right"
      @click="handleResize(indexNotDisplay)"
    />
  </div>
</template>

<script lang="ts">
import { usePlayerStore } from "@/stores/PlayerStore";
import { mapState } from "pinia";
import dayjs from "dayjs";
import { fetchRadioData } from "../../../mixins/radio/fetchRadioData";
import { defineComponent } from "vue";
import { MediaRadio } from "@/stores/class/general/player";
export default defineComponent({
  name: "RadioHistory",

  components: {},

  mixins: [fetchRadioData],
  emits: ["updateNotListenTime"],
  data() {
    return {
      indexStart: 0 as number,
      indexNotDisplay: 100 as number,
    };
  },

  computed: {
    ...mapState(usePlayerStore, ["playerRadio"]),
    playerRadioHistory() {
      return this.playerRadio?.history ?? [];
    },
  },
  watch: {
    playerRadioHistory: {
      deep: true,
      immediate: true,
      handler() {
        this.$nextTick(() => {
          this.handleResize(0);
        });
      },
    },
  },
  created() {
    window.addEventListener("resize", () => {
      this.handleResize(0);
    });
  },
  unmounted() {
    window.removeEventListener("resize", () => {
      this.handleResize(0);
    });
  },
  mounted() {
    this.handleResize(0);
  },
  methods: {
    displayEverythingAfterIndex(indexAsked: number){
      for (let index = 0; index < this.playerRadioHistory.length; index++) {
        const el = (this.$refs["history" + index] as Array<HTMLElement>)[0];
        if (!el) continue;
        if (index < indexAsked && !el.classList.contains("hid")) {
          el.classList.add("hid");
          continue;
        }
        if (index >= indexAsked && el.classList.contains("hid")) {
          el.classList.remove("hid");
        }
      }
    },
    handleResize(indexAsked: number): void {
      const historyList = this.$refs.historyListContainer as HTMLElement;
      if (null === historyList || !historyList) {
        return;
      }
      this.indexStart = indexAsked;
      this.indexNotDisplay = this.playerRadioHistory.length;
      this.displayEverythingAfterIndex(indexAsked);
      for (
        let index = this.indexStart + 1;
        index < this.playerRadioHistory.length;
        index++
      ) {
        const el = (this.$refs["history" + index] as Array<HTMLElement>)[0];
        if (!el) continue;
        if (index > this.indexNotDisplay && !el.classList.contains("hid")) {
          el.classList.add("hid");
          continue;
        }
        const parent = el.parentElement;
        if (parent && el.offsetLeft + el.clientWidth > parent.clientWidth) {
          this.indexNotDisplay = index;
          el.classList.add("hid");
        }
      }
    },
    displayTimeItem(item: MediaRadio): string {
      return dayjs(item.startDate).format("HH:mm");
    },
    displayPreviousItem(item: MediaRadio): string {
      if (item.podcastId) {
        return item.title;
      }
      return this.displayTitle(item);
    },
  },
});
</script>
<style lang="scss">
.octopus-app {
  .history-list-container {
    display: inline-flex;
    justify-content: flex-start;
    overflow: hidden;
    flex-grow: 1;
    width: 0;
    position: relative;
  }
  .hour-past-item {
    font-size: 0.8rem;
    color: #dbdbdb;
  }
}
</style>
