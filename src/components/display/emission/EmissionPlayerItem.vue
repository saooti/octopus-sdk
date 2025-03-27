<template>
  <div class="emission-player-container">
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
      }"
      :title="$t('Series name page', { name: emission.name })"
      class="d-flex flex-column text-dark"
    >
      <div v-if="rubriqueName" class="emission-player-item-info">
        {{ rubriqueName }}
      </div>
      <div class="img-box">
        <img
          v-lazy="useProxyImageUrl(emission.imageUrl, '330')"
          width="330"
          height="330"
          role="presentation"
          alt=""
          :title="$t('Emission name image', { name: emission.name })"
          class="img-box"
        />
      </div>
      <div class="fw-bold text-uppercase text-truncate p-2">
        {{ emission.name }}
      </div>
    </router-link>
    <div
      v-for="p in podcasts"
      :key="p.podcastId"
      class="border-top emission-item-border-color p-2 d-flex flex-column"
    >
      <router-link
        v-if="isProgressBar"
        :to="{
          name: 'podcast',
          params: { podcastId: p.podcastId },
        }"
        :title="$t('Episode name page', { name: p.title })"
        class="text-dark fw-bold basic-line-clamp"
      >
        {{ p.title }}
      </router-link>
      <div class="d-flex justify-content-between flex-grow-1">
        <div class="d-flex flex-column">
          <router-link
            v-if="!isProgressBar"
            :to="{
              name: 'podcast',
              params: { podcastId: p.podcastId },
            }"
            :title="$t('Episode name page', { name: p.title })"
            class="d-flex flex-grow-1 align-items-center define-width text-dark"
          >
            <div class="fw-bold text-truncate">
              {{ p.title }}
            </div>
          </router-link>
          <PodcastPlayBar
            v-else
            :displayButonPlay="true"
            :podcast="p"
          />
        </div>
        <PodcastPlayBasicButton v-if="!isProgressBar"/>
      </div>
    </div>
    <div
      v-if="buttonMore && podcasts.length === nbPodcasts"
      class="border-top emission-item-border-color p-2 octopus-bg d-flex justify-content-center"
    >
      <router-link
        :to="{
          name: 'emission',
          params: { emissionId: emission.emissionId },
        }"
        class="btn"
      >
        {{ $t("More episodes") }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import classicApi from "../../../api/classicApi";
import { Emission } from "@/stores/class/general/emission";
import { Podcast } from "@/stores/class/general/podcast";
import { state } from "../../../stores/ParamSdkStore";
import {useImageProxy} from "../../composable/useImageProxy";
import {useOrgaComputed} from "../../composable/useOrgaComputed";
import { defineAsyncComponent, defineComponent } from "vue";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
const PodcastPlayBar = defineAsyncComponent(
  () => import("../podcasts/PodcastPlayBar.vue"),
);
const PodcastPlayBasicButton = defineAsyncComponent(() => import("./PodcastPlayBasicButton.vue"));
export default defineComponent({
  name: "EmissionPlayerItem",

  components: {
    PodcastPlayBar,
    PodcastPlayBasicButton
  },
  props: {
    emission: { default: () => ({}), type: Object as () => Emission },
    nbPodcasts: { default: undefined, type: Number },
    rubriqueName: { default: undefined, type: String },
  },
  setup(){
    const { useProxyImageUrl } = useImageProxy();
    const { isEditRights } = useOrgaComputed();
    return { useProxyImageUrl, isEditRights }
  },

  data() {
    return {
      activeEmission: true as boolean,
      podcasts: [] as Array<Podcast>,
    };
  },

  computed: {
    isProgressBar(): boolean {
      return state.emissionsPage.progressBar as boolean;
    },
    buttonMore(): boolean {
      return state.emissionsPage.buttonMore as boolean;
    },
    editRight(): boolean {
      return this.isEditRights(this.emission?.orga.id);
    },
  },

  created() {
    this.loadPodcasts();
  },
  methods: {
    async loadPodcasts(): Promise<void> {
      const nb = this.nbPodcasts ? this.nbPodcasts : 2;
      const data = await classicApi.fetchData<ListClassicReturn<Podcast>>({
        api: 0,
        path: "podcast/search",
        parameters: {
          emissionId: this.emission.emissionId,
          size: nb,
          includeStatus: ["READY", "PROCESSING"],
        },
        specialTreatement: true,
      });
      if (0 === data.count) {
        this.activeEmission = false;
      }
      this.podcasts = data.result;
    },
  },
});
</script>

<style lang="scss">


.emission-player-container {
  list-style: none;
  background: var(--octopus-background);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--octopus-image-size);
  height: min-content;
  border: 2px solid var(--octopus-border-default);
  border-radius: var(--octopus-border-radius);
  overflow: hidden;

  .emission-item-border-color {
    border-color: var(--octopus-secondary);
  }

  .define-width {
    width: 9rem;
  }

  @media (width <= 960px) {
    .d-flex:not(.flex-column) {
      flex-wrap: nowrap;
    }
  }
  
  @media (width <= 450px) {
    max-width: var(--octopus-image-size);
  }
}
</style>
