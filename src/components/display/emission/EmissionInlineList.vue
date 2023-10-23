<template>
  <div class="d-flex flex-column p-3 list-episode">
    <ClassicLoading
      :loading-text="loading ? $t('Loading emissions ...') : undefined"
    />
    <SwiperList
      v-if="(displayRubriquage && rubriques) || !(displayRubriquage && loaded)"
      :size-item-overload="itemSize"
      :list-object="allEmissions"
    >
      <template #octopusSlide="{ option }">
        <EmissionPlayerItem
          class="flex-shrink-0 item-phone-margin"
          :emission="option"
          :class="[mainRubriquage(option)]"
          :nb-podcasts="nbPodcasts"
          :rubrique-name="rubriquesId(option)"
        />
      </template>
    </SwiperList>
    <router-link
      :to="href"
      class="btn btn-primary align-self-center width-fit-content m-4"
    >
      {{ buttonText }}
    </router-link>
  </div>
</template>

<script lang="ts">
import SwiperList from "../list/SwiperList.vue";
import octopusApi from "@saooti/octopus-api";
import EmissionPlayerItem from "./EmissionPlayerItem.vue";
import { state } from "../../../stores/ParamSdkStore";
import { handle403 } from "../../mixins/handle403";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { Emission } from "@/stores/class/general/emission";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { defineComponent } from "vue";
import { AxiosError } from "axios";
import imageProxy from "../../mixins/imageProxy";
import resizePhone from "../../mixins/resizePhone";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
export default defineComponent({
  name: "EmissionInlineList",

  components: {
    EmissionPlayerItem,
    ClassicLoading,
    SwiperList,
  },

  mixins: [handle403, imageProxy, resizePhone],

  props: {
    organisationId: { default: undefined, type: String },
    href: { default: undefined, type: String },
    buttonText: { default: undefined, type: String },
    rubriqueId: { default: undefined, type: Number },
    rubriquageId: { default: undefined, type: Number },
    nbPodcasts: { default: undefined, type: Number },
    itemSize: { default: undefined, type: Number },
  },

  data() {
    return {
      loading: true as boolean,
      allEmissions: [] as Array<Emission>,
      rubriques: undefined as Array<Rubrique> | undefined,
    };
  },

  computed: {
    displayRubriquage(): number | undefined {
      return state.emissionsPage.rubriquage;
    },
  },

  mounted() {
    this.fetchNext();
    if (this.displayRubriquage) {
      this.fetchRubriques();
    }
  },
  methods: {
    async fetchNext(): Promise<void> {
      try {
        const data = await octopusApi.fetchDataWithParams<{
          count: number;
          result: Array<Emission>;
          sort: string;
        }>(
          0,
          "emission/search",
          {
            first: 0,
            size: 10,
            organisationId: this.organisationId,
            rubriqueId: this.rubriqueId ? [this.rubriqueId] : [],
            rubriquageId: this.rubriquageId ? [this.rubriquageId] : [],
            sort: "LAST_PODCAST_DESC",
          },
          true,
        );
        this.allEmissions = this.allEmissions.concat(
          data.result.filter((em: Emission | null) => null !== em),
        );
        this.loading = false;
      } catch (error) {
        this.handle403(error as AxiosError);
      }
    },

    reset(): void {
      this.loading = true;
      this.allEmissions.length = 0;
    },
    async fetchRubriques(): Promise<void> {
      const data = await octopusApi.fetchData<Rubriquage>(
        0,
        "rubriquage/" + this.displayRubriquage,
      );
      this.rubriques = data.rubriques;
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
        (element: Rubrique) =>
          element.rubriqueId &&
          emission.rubriqueIds.includes(element.rubriqueId) &&
          element.rubriquageId === this.displayRubriquage,
      );
      if (rubrique) {
        return rubrique.name;
      }
    },
    mainRubriquage(emission: Emission): string {
      return state.emissionsPage.mainRubrique &&
        emission.rubriqueIds?.includes(state.emissionsPage.mainRubrique)
        ? "partenaireRubrique"
        : "";
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  .list-episode {
    padding: 2rem 0rem 1rem !important;
    @media (max-width: 450px) {
      padding: 0.5rem 0rem 1rem !important;
    }
    h2 {
      margin-bottom: 1rem;
    }
  }
}
</style>
