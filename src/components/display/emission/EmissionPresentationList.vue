<template>
  <div class="d-flex flex-column p-3">
    <h2 class="mb-3">{{ title }}</h2>
    <ClassicLoading
      :loading-text="loading ? $t('Loading emissions ...') : undefined"
      :error-text="error ? $t(`Error`) : undefined"
    />
    <template v-if="!loading && !error">
      <div class="d-flex flex-nowrap align-items-stretch overflow-phone-auto">
        <EmissionItemPresentation
          v-if="allEmissions[0]"
          :class="!isPhone ? 'me-3' : ''"
          :emission="allEmissions[0]"
          :is-vertical="!isPhone"
        />
        <div
          v-if="allEmissions.length > 1"
          class="emission-column emission-column-margin d-flex-row flex-nowrap"
        >
          <EmissionItemPresentation
            v-if="allEmissions[1]"
            :emission="allEmissions[1]"
          />
          <EmissionItemPresentation
            v-if="allEmissions[2]"
            :emission="allEmissions[2]"
          />
        </div>
        <div
          v-if="allEmissions.length > 3"
          class="emission-column d-flex-row flex-nowrap show-emission-column"
        >
          <EmissionItemPresentation
            v-if="allEmissions[3]"
            :emission="allEmissions[3]"
          />
          <EmissionItemPresentation
            v-if="allEmissions[4]"
            :emission="allEmissions[4]"
          />
        </div>
      </div>
      <router-link
        v-if="buttonText && href"
        :to="href"
        class="btn btn-primary align-self-center width-fit-content m-4"
      >
        {{ buttonText }}
      </router-link>
    </template>
  </div>
</template>

<script lang="ts">
import octopusApi from "@saooti/octopus-api";
import { handle403 } from "../../mixins/handle403";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { Emission } from "@/stores/class/general/emission";
import { defineAsyncComponent, defineComponent } from "vue";
import { AxiosError } from "axios";
import imageProxy from "../../mixins/imageProxy";
import resizePhone from "../../mixins/resizePhone";
const EmissionItemPresentation = defineAsyncComponent(
  () => import("./EmissionPresentationItem.vue"),
);
export default defineComponent({
  name: "EmissionPresentationList",
  components: {
    ClassicLoading,
    EmissionItemPresentation,
  },

  mixins: [handle403, imageProxy, resizePhone],

  props: {
    organisationId: { default: undefined, type: String },
    title: { default: "", type: String },
    href: { default: undefined, type: String },
    buttonText: { default: undefined, type: String },
  },
  data() {
    return {
      loading: true as boolean,
      error: false as boolean,
      allEmissions: [] as Array<Emission>,
      isPhone: false as boolean,
      windowWidth: 0 as number,
    };
  },

  mounted() {
    this.fetchNext();
  },
  methods: {
    async fetchNext(): Promise<void> {
      this.loading = true;
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
            size: 5,
            organisationId: this.organisationId,
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
        this.error = true;
      }
      this.loading = false;
    },
  },
});
</script>
<style lang="scss">
.octopus-app {
  .overflow-phone-auto {
    @media (max-width: 960px) {
      overflow-y: auto;
    }
  }
  .emission-column {
    flex-shrink: 0;
    width: calc((100% - 420px) / 2);
    @media (max-width: 1550px) {
      width: calc((100% - 420px));
    }
    @media (max-width: 960px) {
      width: auto;
      flex-direction: row !important;
    }
  }
  .emission-column-margin {
    margin-right: 1rem;
    @media (max-width: 960px) {
      margin-right: 0;
    }
  }
  .show-emission-column {
    display: flex;
    @media (max-width: 1550px) {
      display: none !important;
    }
    @media (max-width: 960px) {
      display: flex !important;
    }
  }
}
</style>
