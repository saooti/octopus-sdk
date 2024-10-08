<template>
  <div class="emission-player-container">
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
        query: { productor: filterOrgaId },
      }"
      class="d-flex flex-column text-dark"
    >
      <div v-if="rubriqueName" class="emissionPlayerItem-info">
        {{ rubriqueName }}
      </div>
      <div class="img-box rounded-0">
        <img
          v-lazy="proxyImageUrl(emission.imageUrl, '330')"
          width="330"
          height="330"
          :title="$t('Emission name image', { name: emission.name })"
          :alt="$t('Emission name image', { name: emission.name })"
          class="img-box rounded-0"
        />
        <div v-if="titleInImage" class="titleInImage">
          {{ emission.name }}
        </div>
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
          query: { productor: filterOrgaId },
        }"
        class="text-dark fw-bold two-line-clamp"
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
              query: { productor: filterOrgaId },
            }"
            class="d-flex flex-grow-1 align-items-center define-width text-dark"
          >
            <div class="fw-bold text-truncate">
              {{ p.title }}
            </div>
          </router-link>
          <PodcastPlayBar
            v-else
            :podcast-id="p.podcastId"
            :duration="p.duration"
          />
        </div>
        <button
          v-if="
            playerPodcast !== p ||
            (playerPodcast === p && 'PAUSED' === playerStatus)
          "
          class="play-button-box bg-secondary"
          @click="play(p)"
        >
          <div class="text-light saooti-play" :title="$t('Play')" />
        </button>
        <button v-else class="play-button-box bg-secondary" @click="pause(p)">
          <div class="text-light saooti-pause" :title="$t('Pause')" />
        </button>
      </div>
    </div>
    <div
      v-if="buttonMore && podcasts.length === nbPodcasts"
      class="border-top emission-item-border-color p-2 secondary-bg d-flex justify-content-center"
    >
      <router-link
        :to="{
          name: 'emission',
          params: { emissionId: emission.emissionId },
          query: { productor: filterOrgaId },
        }"
        class="btn"
      >
        {{ $t("More episodes") }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import octopusApi from "@saooti/octopus-api";
import { Emission } from "@/stores/class/general/emission";
import { Podcast } from "@/stores/class/general/podcast";
import { state } from "../../../stores/ParamSdkStore";
import imageProxy from "../../mixins/imageProxy";
import displayMethods from "../../mixins/displayMethods";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { useFilterStore } from "../../../stores/FilterStore";
import { mapState, mapActions } from "pinia";
import { defineAsyncComponent, defineComponent } from "vue";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
const PodcastPlayBar = defineAsyncComponent(
  () => import("../podcasts/PodcastPlayBar.vue"),
);
export default defineComponent({
  name: "EmissionPlayerItem",

  components: {
    PodcastPlayBar,
  },
  mixins: [displayMethods, imageProxy],
  props: {
    emission: { default: () => ({}), type: Object as () => Emission },
    nbPodcasts: { default: undefined, type: Number },
    rubriqueName: { default: undefined, type: String },
  },

  data() {
    return {
      activeEmission: true as boolean,
      podcasts: [] as Array<Podcast>,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    ...mapState(usePlayerStore, ["playerPodcast", "playerStatus"]),
    isProgressBar(): boolean {
      return state.emissionsPage.progressBar as boolean;
    },
    buttonMore(): boolean {
      return state.emissionsPage.buttonMore as boolean;
    },
    titleInImage(): boolean {
      return state.emissionsPage.titleInImage as boolean;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated ?? false;
    },
    organisationId(): string | undefined {
      return state.generalParameters.organisationId;
    },
    editRight(): boolean {
      return (
        (true === this.authenticated &&
          this.organisationId === this.emission.orga.id) ||
        true === state.generalParameters.isAdmin
      );
    },
  },

  created() {
    this.loadPodcasts();
  },
  methods: {
    ...mapActions(usePlayerStore, ["playerPlay", "playerChangeStatus"]),
    play(podcast: Podcast): void {
      if (podcast === this.playerPodcast) {
        this.playerChangeStatus(false);
      } else {
        this.playerPlay(podcast);
      }
    },
    pause(): void {
      this.playerChangeStatus(true);
    },
    async loadPodcasts(): Promise<void> {
      const nb = this.nbPodcasts ? this.nbPodcasts : 2;
      const data = await octopusApi.fetchDataWithParams<
        ListClassicReturn<Podcast>
      >(
        0,
        "podcast/search",
        {
          emissionId: this.emission.emissionId,
          size: nb,
          includeStatus: ["READY", "PROCESSING"],
        },
        true,
      );
      if (0 === data.count) {
        this.activeEmission = false;
      }
      this.podcasts = data.result;
    },
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
.emission-player-container {
  list-style: none;
  background: #fff;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: $octopus-item-size;
  height: min-content;
  border: 2px solid #eee;
  border-radius: $octopus-borderradius;
  overflow: hidden;
  .emission-item-border-color {
    border-color: #ddd;
  }
  .define-width {
    width: 9rem;
  }
  @media (max-width: 960px) {
    .d-flex:not(.flex-column) {
      flex-wrap: nowrap;
    }
  }
  @media (max-width: 450px) {
    max-width: $octopus-mobile-item-size;
  }
}
</style>
