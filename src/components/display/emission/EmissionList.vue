<template>
  <ListPaginate
    id="emissionListPaginate"
    v-model:first="dfirst"
    v-model:rowsPerPage="dsize"
    v-model:isMobile="isMobile"
    :text-count="
      showCount && emissions.length > 1
        ? $t('Number emissions', { nb: displayCount }) + sortText
        : undefined
    "
    :total-count="totalCount"
    :loading="loading"
    :loading-text="loading ? $t('Loading emissions ...') : undefined"
    :player-responsive="true"
  >
    <template #list>
      <div
        v-if="!itemPlayer"
        class="emission-list"
        :class="smallItems ? 'three-emissions' : 'two-emissions'"
      >
        <ClassicLazy
          v-for="e in displayArray"
          :key="e.emissionId"
          :min-height="250"
        >
          <EmissionItem v-if="0 !== e.emissionId" :emission="e" />
          <template #preview>
            <router-link
              :to="{
                name: 'emission',
                params: { emissionId: e.emissionId },
              }"
            >
              {{ e.name }}
            </router-link>
          </template>
        </ClassicLazy>
      </div>
      <div
        v-else
        v-show="(displayRubriquage && rubriques) || !displayRubriquage"
        class="d-flex flex-wrap justify-content-around"
      >
        <template v-for="e in displayArray" :key="e.emissionId">
          <EmissionPlayerItem
            v-if="0 !== e.emissionId"
            :emission="e"
            class="m-3 flex-shrink-0"
            :class="mainRubriquage(e)"
            :nb-podcasts="nbPodcasts"
            :rubrique-name="rubriquesId(e)"
          />
        </template>
      </div>
    </template>
  </ListPaginate>
</template>

<script lang="ts">
import ListPaginate from "../list/ListPaginate.vue";
import octopusApi from "@saooti/octopus-api";
import ClassicLazy from "../../misc/ClassicLazy.vue";
import { handle403 } from "../../mixins/handle403";
import { state } from "../../../stores/ParamSdkStore";
import { Emission, emptyEmissionData } from "@/stores/class/general/emission";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { defineComponent, defineAsyncComponent } from "vue";
import { FetchParam } from "@/stores/class/general/fetchParam";
import { AxiosError } from "axios";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { useFilterStore } from "../../../stores/FilterStore";
import { mapState } from "pinia";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
const EmissionItem = defineAsyncComponent(() => import("./EmissionItem.vue"));
const EmissionPlayerItem = defineAsyncComponent(
  () => import("./EmissionPlayerItem.vue"),
);
export default defineComponent({
  name: "EmissionList",

  components: {
    EmissionItem,
    EmissionPlayerItem,
    ListPaginate,
    ClassicLazy,
  },

  mixins: [handle403],

  props: {
    first: { default: 0, type: Number },
    size: { default: 30, type: Number },
    query: { default: undefined, type: String },
    iabId: { default: undefined, type: Number },
    organisationId: { default: undefined, type: String },
    monetization: { default: "UNDEFINED", type: String },
    before: { default: undefined, type: String },
    after: { default: undefined, type: String },
    sort: { default: "DATE", type: String },
    showCount: { default: false, type: Boolean },
    includeHidden: { default: false, type: Boolean },
    rubriqueId: { default: () => [], type: Array as () => Array<number> },
    rubriquageId: { default: () => [], type: Array as () => Array<number> },
    noRubriquageId: { default: () => [], type: Array as () => Array<number> },
    nbPodcasts: { default: undefined, type: Number },
  },

  data() {
    return {
      loading: true as boolean,
      dfirst: this.first,
      dsize: this.size,
      totalCount: 0 as number,
      displayCount: 0 as number,
      emissions: [] as Array<Emission>,
      rubriques: undefined as Array<Rubrique> | undefined,
      isMobile: false as boolean,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    displayArray(): Array<Emission> {
      if (this.isMobile) {
        return this.emissions;
      }
      return this.emissions.slice(
        this.dfirst,
        Math.min(this.dfirst + this.dsize, this.totalCount),
      );
    },
    smallItems(): boolean {
      return state.emissionsPage.smallItems as boolean;
    },
    itemPlayer(): boolean {
      return state.emissionsPage.itemPlayer as boolean;
    },
    displayRubriquage(): number | undefined {
      return state.emissionsPage.rubriquage;
    },
    changed(): string {
      return `${this.first}|${this.size}|${this.organisationId}|${this.query}|${this.monetization}|${this.includeHidden}
      ${this.iabId}|${this.rubriqueId}|${this.rubriquageId}|${this.before}|${this.after}|${this.sort}|${this.noRubriquageId}`;
    },
    sortText(): string {
      let textSort = "";
      switch (this.sort) {
        case "SCORE":
          textSort = " " + this.$t("sort by score");
          break;
        case "LAST_PODCAST_DESC":
          textSort = " " + this.$t("sort by date");
          break;
        case "NAME":
          textSort = " " + this.$t("sort by alphabetical");
          break;
        default:
          textSort = " " + this.$t("sort by date");
          break;
      }

      return textSort.replace("triés", "triées");
    },
    organisation(): string | undefined {
      return this.organisationId ? this.organisationId : this.filterOrgaId;
    },
  },
  watch: {
    changed(): void {
      this.reloadList();
    },
    dsize(): void {
      this.reloadList();
    },
    dfirst(): void {
      if (
        !this.emissions[this.dfirst] ||
        0 === this.emissions[this.dfirst].emissionId
      ) {
        this.fetchContent(false);
      }
    },
  },

  mounted() {
    this.fetchContent(true);
    if (this.displayRubriquage) {
      this.fetchRubriques();
    }
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
        query: this.query,
        organisationId: this.organisation,
        monetisable: this.monetization,
        iabId: this.iabId,
        before: this.before,
        after: this.after,
        sort: this.sort,
        noRubriquageId: this.noRubriquageId.length
          ? this.noRubriquageId
          : undefined,
        rubriqueId: this.rubriqueId.length ? this.rubriqueId : undefined,
        rubriquageId: this.rubriquageId.length ? this.rubriquageId : undefined,
        includeHidden: this.includeHidden,
      };
      try {
        const data = await octopusApi.fetchDataWithParams<
          ListClassicReturn<Emission>
        >(0, "emission/search", param, true);
        this.afterFetching(reset, data);
      } catch (error) {
        this.handle403(error as AxiosError);
      }
    },
    afterFetching(
      reset: boolean,
      data: { count: number; result: Array<Emission>; sort: string },
    ): void {
      if (reset) {
        this.emissions.length = 0;
      }
      if (this.dfirst > this.emissions.length) {
        for (
          let i = this.emissions.length - 1, len = this.dfirst + this.dsize;
          i < len;
          i++
        ) {
          this.emissions.push(emptyEmissionData());
        }
      }
      this.displayCount = data.count;
      const responseEmissions = data.result.filter((e: Emission | null) => {
        if (null === e) {
          this.displayCount--;
        }
        return null !== e;
      });
      this.emissions = this.emissions
        .slice(0, this.dfirst)
        .concat(responseEmissions)
        .concat(
          this.emissions.slice(this.dfirst + this.dsize, this.emissions.length),
        );
      this.totalCount = data.count;
      this.loading = false;
    },
    async fetchRubriques(): Promise<void> {
      const data = await octopusApi.fetchData<Rubriquage>(
        0,
        "rubriquage/" + this.displayRubriquage,
      );
      this.rubriques = data.rubriques;
    },
    mainRubriquage(emission: Emission): string {
      return emission.rubriqueIds?.[0] === state.emissionsPage.mainRubrique
        ? "partenaireRubrique"
        : "";
    },
    rubriquesId(emission: Emission): string | undefined {
      if (
        !this.displayRubriquage ||
        !emission.rubriqueIds ||
        0 === emission.rubriqueIds.length ||
        !this.rubriques ||
        !this.rubriques.length
      )
        return undefined;
      const rubrique = this.rubriques.find(
        (element: Rubrique) => element.rubriqueId === emission.rubriqueIds[0],
      );
      if (!rubrique) {
        return undefined;
      }
      return rubrique.name;
    },
  },
});
</script>
