<template>
  <div v-if="displayLiveList" class="d-flex flex-column align-items-start mt-3">
    <div
      class="d-flex justify-content-between flex-grow-1 mb-3 w-100 align-items-center"
    >
      <h2 class="mb-0 big-h2">
        {{ $t("Live") }}
      </h2>
      <router-link
        v-if="liveRight && !isPodcastmaker"
        to="/main/priv/edit/live"
      >
        <button class="btn btn-primary">
          {{ $t("Launch a new live") }}
        </button>
      </router-link>
    </div>
    <ClassicSelect
      v-if="lives.length || 'ALL' !== selectedStatus"
      v-model:textInit="selectedStatus"
      id-select="status-live-chooser-select"
      :label="$t('Selection by status')"
      :display-label="false"
      :options="statusArraySelect"
      class="mb-3"
    />
    <ClassicLoading
      :loading-text="loading ? $t('Loading lives...') : undefined"
      :error-text="0 === lives.length ? $t('No live currently') : undefined"
    />
    <template v-if="lives.length">
      <SwiperList v-if="!loading" :list-object="lives">
        <template #octopusSlide="{ option, index }">
          <LiveItem
            :fetch-conference="option"
            @delete-item="deleteLive(index)"
            @update-item="updateLive($event, index)"
          />
        </template>
      </SwiperList>
    </template>
  </div>
</template>

<script lang="ts">
import ClassicLoading from "../../form/ClassicLoading.vue";
import LiveItem from "./LiveItem.vue";
import ClassicSelect from "../../form/ClassicSelect.vue";
import SwiperList from "../list/SwiperList.vue";
import { handle403 } from "../../mixins/handle403";
import { orgaComputed } from "../../mixins/orgaComputed";
import octopusApi from "@saooti/octopus-api";
import { useFilterStore } from "@/stores/FilterStore";
import { useAuthStore } from "@/stores/AuthStore";
import { mapActions, mapState } from "pinia";
import { state } from "../../../stores/ParamSdkStore";
import { Conference } from "@/stores/class/conference/conference";
import { defineComponent } from "vue";
import { AxiosError } from "axios";
import { useSaveFetchStore } from "@/stores/SaveFetchStore";
export default defineComponent({
  name: "LiveList",
  components: {
    LiveItem,
    ClassicLoading,
    SwiperList,
    ClassicSelect,
  },

  mixins: [handle403, orgaComputed],

  props: {
    organisationId: { default: undefined, type: String },
    hideIfEmpty: { default: false, type: Boolean },
  },
  data() {
    return {
      loading: true as boolean,
      loaded: true as boolean,
      lives: [] as Array<Conference>,
      isLiveAuthorized: false as boolean,
      statusClassic: ["RECORDING", "PENDING", "PLANNED"] as Array<string>,
      statusAdmin: ["DEBRIEFING", "ERROR", "PUBLISHING"] as Array<string>,
      selectedStatus: "ALL" as string,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    ...mapState(useAuthStore, ["authOrganisation"]),
    displayLiveList(): boolean {
      return (
        (undefined !== this.filterOrgaId ||
          undefined !== this.organisationId) &&
        (!this.hideIfEmpty || (this.hideIfEmpty && 0 !== this.lives.length))
      );
    },
    filterOrgaUsed(): string | undefined {
      return this.filterOrgaId ? this.filterOrgaId : this.organisationId;
    },
    editRight(): boolean {
      return (
        (true === this.authenticated &&
          this.myOrganisationId === this.filterOrgaUsed) ||
        true === state.generalParameters.isAdmin
      );
    },
    liveRight(): boolean {
      return (
        (state.generalParameters.isRoleLive as boolean) &&
        "true" === this.authOrganisation.attributes?.["live.active"]
      );
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    statusArraySelect(): Array<{ title: string; value: string }> {
      const statusArray = [{ title: this.$t("All lives"), value: "ALL" }];
      for (let status of this.statusFetched) {
        let title = "";
        switch (status) {
          case "RECORDING":
            title = this.$t("In live");
            break;
          case "PENDING":
            title = this.$t("live upcoming");
            break;
          case "PLANNED":
            title = this.$t("live in few time");
            break;
          case "DEBRIEFING":
            title = this.$t("In debriefing");
            break;
          case "PUBLISHING":
            title = this.$t("In the process of being published");
            break;
          case "ERROR":
            title = this.$t("In error");
            break;
          default:
            break;
        }
        statusArray.push({ title: title, value: status });
      }
      return statusArray;
    },
    statusFetched(): Array<string> {
      if (this.editRight) {
        return this.statusClassic.concat(this.statusAdmin);
      }
      return this.statusClassic;
    },
  },
  watch: {
    filterOrgaUsed: {
      async handler(): Promise<void> {
        await this.checkIfLiveAuthorized();
        this.fetchContent();
      },
      immediate: true,
    },
    selectedStatus() {
      this.fetchContent();
    },
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaLiveEnabled"]),
    async checkIfLiveAuthorized(): Promise<void> {
      if (!this.filterOrgaUsed) {
        return;
      }
      this.isLiveAuthorized = await this.getOrgaLiveEnabled(
        this.filterOrgaUsed,
      );
    },
    endLoading(): void {
      this.loading = false;
      this.loaded = true;
    },
    updateLive(live: Conference, index: number): void {
      this.lives.splice(index, 1, live);
    },
    async fetchContent(): Promise<void> {
      this.lives.length = 0;
      if (!this.filterOrgaUsed || !this.isLiveAuthorized) {
        this.endLoading();
        return;
      }
      this.loading = true;
      this.loaded = false;
      try {
        const dataLives = await octopusApi.fetchDataWithParams<
          Array<Conference>
        >(9, "conference/list", {
          organisationId: this.filterOrgaUsed,
          withPodcastId: true,
          status:
            "ALL" === this.selectedStatus
              ? this.statusFetched
              : this.selectedStatus,
        });
        this.lives = dataLives.filter((p: Conference | null) => {
          return null !== p;
        });
      } catch (error) {
        this.handle403(error as AxiosError);
      }
      this.endLoading();
    },
    deleteLive(index: number): void {
      this.lives.splice(index, 1);
    },
  },
});
</script>
