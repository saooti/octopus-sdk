<template>
  <ListPaginate
    id="podcastListPaginate"
    v-model:first="dfirst"
    v-model:rowsPerPage="dsize"
    v-model:isMobile="isMobile"
    :text-count="
      showCount && podcasts.length > 1
        ? $t('Number podcasts', { nb: totalCount }) + sortText
        : undefined
    "
    :total-count="totalCount"
    :loading="loading"
    :loading-text="loading ? $t('Loading podcasts ...') : undefined"
    :error-text="
      !loading && !podcasts.length
        ? $t(`No podcast match your query`)
        : undefined
    "
    :just-size-chosen="justSizeChosen"
  >
    <template #list>
      <div class="podcast-list">
        <template v-for="p in displayArray" :key="p.podcastId">
          <PodcastItem v-if="0 !== p.podcastId" :podcast="p" />
        </template>
      </div>
    </template>
  </ListPaginate>
</template>

<script lang="ts">
import ListPaginate from "../list/ListPaginate.vue";
import { handle403 } from "../../mixins/handle403";
import octopusApi from "@saooti/octopus-api";
import PodcastItem from "./PodcastItem.vue";
import { state } from "../../../stores/ParamSdkStore";
import { useAuthStore } from "@/stores/AuthStore";
import { useFilterStore } from "@/stores/FilterStore";
import { mapState } from "pinia";
import { Podcast, emptyPodcastData } from "@/stores/class/general/podcast";
import { defineComponent } from "vue";
import { FetchParam } from "@/stores/class/general/fetchParam";
import { AxiosError } from "axios";
export default defineComponent({
  name: "PodcastList",

  components: {
    PodcastItem,
    ListPaginate,
  },

  mixins: [handle403],

  props: {
    first: { default: 0, type: Number },
    size: { default: 30, type: Number },
    organisationId: { default: () => [], type: Array as () => Array<string> },
    emissionId: { default: undefined, type: Number },
    iabId: { default: undefined, type: Number },
    participantId: { default: undefined, type: Number },
    query: { default: undefined, type: String },
    monetization: { default: undefined, type: String },
    popularSort: { default: false, type: Boolean },
    reload: { default: false, type: Boolean },
    before: { default: undefined, type: String },
    after: { default: undefined, type: String },
    includeHidden: { default: false, type: Boolean },
    showCount: { default: false, type: Boolean },
    displaySortText: { default: true, type: Boolean },
    sortCriteria: { default: undefined, type: String },
    notValid: { default: undefined, type: Boolean },
    rubriqueId: { default: () => [], type: Array as () => Array<number> },
    rubriquageId: { default: () => [], type: Array as () => Array<number> },
    noRubriquageId: { default: () => [], type: Array as () => Array<number> },
    justSizeChosen: { default: false, type: Boolean },
  },
  emits: ["fetch", "emptyList"],

  data() {
    return {
      loading: true as boolean,
      dfirst: this.first,
      dsize: this.size,
      totalCount: 0 as number,
      podcasts: [] as Array<Podcast>,
      isMobile: false as boolean,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    ...mapState(useAuthStore, ["authProfile"]),
    displayArray(): Array<Podcast> {
      if (this.isMobile || this.justSizeChosen) {
        return this.podcasts;
      }
      return this.podcasts.slice(
        this.dfirst,
        Math.min(this.dfirst + this.dsize, this.totalCount),
      );
    },
    changed(): string {
      return `${this.first}|${this.size}|${this.organisation}|${this.emissionId}|${this.sortCriteria}|${this.sort}
      ${this.iabId}|${this.participantId}|${this.query}|${this.monetization}|${this.popularSort}|
      ${this.rubriqueId}|${this.rubriquageId}|${this.before}|${this.after}|${this.includeHidden}|${this.noRubriquageId}|${this.notValid}`;
    },
    organisation(): Array<string> {
      if (this.organisationId) {
        return this.organisationId;
      }
      return this.filterOrgaId ? [this.filterOrgaId] : [];
    },
    sort(): string {
      return this.popularSort ? "POPULARITY" : this.sortCriteria ?? "DATE";
    },
    sortText(): string {
      if (!this.displaySortText) {
        return "";
      }
      switch (this.sortCriteria) {
        case "SCORE":
          return " " + this.$t("sort by score");
        case "DATE":
          return " " + this.$t("sort by date");
        case "NAME":
          return " " + this.$t("sort by alphabetical");
        default:
          return " " + this.$t("sort by date");
      }
    },
  },
  watch: {
    changed(): void {
      this.reloadList();
    },
    reload(): void {
      this.reloadList();
    },
    dsize(): void {
      this.reloadList();
    },
    dfirst(): void {
      if (
        !this.podcasts[this.dfirst] ||
        0 === this.podcasts[this.dfirst].podcastId
      ) {
        this.fetchContent(false);
      }
    },
  },
  async created() {
    await this.fetchContent(true);
  },
  methods: {
    reloadList() {
      this.dfirst = 0;
      this.fetchContent(true);
    },
    async fetchContent(reset: boolean): Promise<void> {
      this.loading = true;
      const param: FetchParam = {
        first: this.dfirst,
        size: this.dsize,
        organisationId: this.organisation,
        emissionId: this.emissionId,
        iabId: this.iabId,
        participantId: this.participantId,
        query: this.query,
        monetisable: this.monetization,
        sort: this.sort,
        before: this.before,
        after: this.after,
        noRubriquageId: this.noRubriquageId.length
          ? this.noRubriquageId
          : undefined,
        rubriqueId: this.rubriqueId.length ? this.rubriqueId : undefined,
        rubriquageId: this.rubriquageId.length ? this.rubriquageId : undefined,
        includeHidden: this.includeHidden,
        validity: undefined !== this.notValid ? !this.notValid : undefined,
        publisherId:
          this.notValid && !(state.generalParameters.isProduction as boolean)
            ? this.authProfile?.userId
            : undefined,
        includeStatus: ["READY", "PROCESSING"],
      };
      try {
        const data = await octopusApi.fetchDataWithParams<{
          count: number;
          result: Array<Podcast>;
          sort: string;
        }>(0, "podcast/search", param, true);
        this.afterFetching(reset, data);
      } catch (error) {
        this.handle403(error as AxiosError);
      }
    },
    afterFetching(
      reset: boolean,
      data: { count: number; result: Array<Podcast>; sort: string },
    ): void {
      if (reset) {
        this.podcasts.length = 0;
      }
      if (this.dfirst > this.podcasts.length) {
        for (
          let i = this.podcasts.length - 1, len = this.dfirst + this.dsize;
          i < len;
          i++
        ) {
          this.podcasts.push(emptyPodcastData());
        }
      }
      const responsePodcasts = data.result.filter((p: Podcast | null) => {
        return null !== p;
      });
      this.podcasts = this.podcasts
        .slice(0, this.dfirst)
        .concat(responsePodcasts)
        .concat(
          this.podcasts.slice(this.dfirst + this.dsize, this.podcasts.length),
        );
      this.$emit("fetch", this.podcasts);
      this.totalCount = this.justSizeChosen ? this.size : data.count;
      if (0 === this.podcasts.length) {
        this.$emit("emptyList");
      }
      this.loading = false;
    },
  },
});
</script>
