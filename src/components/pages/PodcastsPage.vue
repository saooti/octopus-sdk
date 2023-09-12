<template>
  <div class="page-box">
    <ProductorSearch
      v-model:organisation-id="organisationId"
      v-model:search-pattern="searchPattern"
    />
    <AdvancedSearch
      v-model:only-video="onlyVideo"
      :is-education="isEducation"
      :is-emission="false"
      :reset-rubriquage="resetRubriquage"
      :sort-criteria="sortCriteria"
      :include-hidden="includeHidden"
      :organisation-id="organisationId"
      @update-category="iabId = $event"
      @update-rubriquage-filter="updateRubriquageFilter"
      @update-monetization="monetization = $event"
      @update-from-date="fromDate = $event"
      @update-to-date="toDate = $event"
      @update-sort-criteria="sortCriteria = $event"
      @include-hidden="includeHidden = $event"
      @not-valid="notValid = $event"
    />
    <PodcastList
      :show-count="true"
      :first="0"
      :size="30"
      :organisation-id="orgaArray"
      :query="searchPattern"
      :monetization="monetization"
      :before="toDate"
      :after="fromDate"
      :sort-criteria="sortCriteria"
      :include-hidden="includeHidden"
      :not-valid="notValid"
      :iab-id="iabId"
      :rubrique-id="rubriqueId"
      :rubriquage-id="rubriquageId"
      :no-rubriquage-id="noRubriquageId"
      :with-video="withVideo"
    />
  </div>
</template>

<script lang="ts">
import { orgaComputed } from "../mixins/orgaComputed";
import PodcastList from "../display/podcasts/PodcastList.vue";
import { state } from "../../stores/ParamSdkStore";
import ProductorSearch from "../display/filter/ProductorSearch.vue";
import AdvancedSearch from "../display/filter/AdvancedSearch.vue";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { useFilterStore } from "@/stores/FilterStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PodcastsPage",
  components: {
    PodcastList,
    ProductorSearch,
    AdvancedSearch,
  },
  mixins: [orgaComputed],
  props: {
    productor: { default: undefined, type: String },
    isEducation: { default: false, type: Boolean },
    searchInit: { default: "", type: String },
  },
  data() {
    return {
      isInit: false as boolean,
      searchPattern: "" as string,
      organisationId: undefined as string | undefined,
      monetization: "UNDEFINED" as string, // UNDEFINED, YES, NO
      fromDate: undefined as string | undefined,
      toDate: undefined as string | undefined,
      resetRubriquage: false as boolean,
      includeHidden: false as boolean,
      sortCriteria: "DATE" as string, // SCORE, DATE, POPULARITY, NAME, LAST_PODCAST_DESC
      notValid: false as boolean,
      iabId: undefined as number | undefined,
      noRubriquageId: [] as Array<number>,
      rubriquageId: [] as Array<number>,
      rubriqueId: [] as Array<number>,
      onlyVideo: false as boolean,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterRubrique", "filterIab"]),
    organisationRight(): boolean {
      return (
        (true === this.authenticated &&
          this.myOrganisationId === this.organisationId) ||
        true === state.generalParameters.isAdmin
      );
    },
    orgaArray(): Array<string> {
      return this.organisationId ? [this.organisationId] : [];
    },
    organisation(): string | undefined {
      return this.organisationId ? this.organisationId : this.filterOrgaId;
    },
    withVideo(): boolean|undefined{
      return false===this.onlyVideo ? undefined : true;
    }
  },
  watch: {
    organisationId(): void {
      if (!this.isInit) {
        return;
      }
      this.resetRubriquage = !this.resetRubriquage;
      this.rubriquageId = [];
      this.rubriqueId = [];
      this.noRubriquageId = [];
    },
    searchPattern(value: string): void {
      this.sortCriteria = "" !== value ? "SCORE" : "DATE";
    },
  },
  created() {
    this.initPodcastsPage();
  },
  methods: {
    initPodcastsPage() {
      this.searchPattern = this.searchInit ?? "";
      this.organisationId = this.productor ? this.productor : this.filterOrgaId;
      this.includeHidden =
        this.organisation && this.organisationRight ? true : false;
      this.iabId = this.filterIab?.id;
      if (this.filterRubrique.length) {
        this.updateRubriquageFilter(this.filterRubrique);
      }
      this.$nextTick(() => {
        this.isInit = true;
      });
    },
    updateRubriquageFilter(value: Array<RubriquageFilter>) {
      const length = value.length;
      const allRubriquageId: Array<number> = [];
      const noRubriquageId: Array<number> = [];
      const rubriqueId: Array<number> = [];
      for (let index = 0; index < length; index++) {
        if (-1 === value[index].rubriqueId) {
          noRubriquageId.push(value[index].rubriquageId);
        } else if (0 === value[index].rubriqueId) {
          allRubriquageId.push(value[index].rubriquageId);
        } else {
          rubriqueId.push(value[index].rubriqueId);
        }
      }
      this.rubriquageId = allRubriquageId;
      this.rubriqueId = rubriqueId;
      this.noRubriquageId = noRubriquageId;
    },
  },
});
</script>
