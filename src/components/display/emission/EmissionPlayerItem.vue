<template>
  <div class="emission-player-container">
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
      }"
      :title="t('Series name page', { name: emission.name })"
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
          aria-hidden="true"
          :title="t('Emission name image', { name: emission.name })"
          :alt="t('Emission name image', { name: emission.name })"
          class="img-box"
        >
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
        :title="t('Episode name page', { name: p.title })"
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
            :title="t('Episode name page', { name: p.title })"
            class="d-flex flex-grow-1 align-items-center define-width text-dark"
          >
            <div class="fw-bold text-truncate">
              {{ p.title }}
            </div>
          </router-link>
          <PodcastPlayBar
            v-else
            :display-buton-play="true"
            :podcast="p"
          />
        </div>
        <PodcastPlayBasicButton
          v-if="!isProgressBar"
          :podcast="p"
        />
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
        {{ t("More episodes") }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import classicApi from "../../../api/classicApi";
import { Emission } from "@/stores/class/general/emission";
import { Podcast } from "@/stores/class/general/podcast";
import { state } from "../../../stores/ParamSdkStore";
import {useImageProxy} from "../../composable/useImageProxy";
import { computed, defineAsyncComponent, onBeforeMount, Ref, ref } from "vue";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
import { useI18n } from "vue-i18n";
const PodcastPlayBar = defineAsyncComponent(
  () => import("../podcasts/PodcastPlayBar.vue"),
);
const PodcastPlayBasicButton = defineAsyncComponent(() => import("../podcasts/PodcastPlayBasicButton.vue"));

//Props 
const props = defineProps({
  emission: { default: () => ({}), type: Object as () => Emission },
  /** Number of podcasts to display (default: 2); if set to 0, no podcasts will be displayed */
  nbPodcasts: { default: undefined, type: Number },
  rubriqueName: { default: undefined, type: String },
})

//Data 
const activeEmission = ref(true);
const podcasts: Ref<Array<Podcast>> = ref([]);
  

//Composables
const { t } = useI18n();
const { useProxyImageUrl } = useImageProxy();

//Computed
const isProgressBar = computed(() => state.emissionsPage.progressBar as boolean);
const buttonMore = computed(() => state.emissionsPage.buttonMore as boolean);


onBeforeMount(()=>loadPodcasts())

//Methods
async function loadPodcasts(): Promise<void> {
  if (props.nbPodcasts === 0) {
    return;
  }

  const nb = props.nbPodcasts ? props.nbPodcasts : 2;
  const data = await classicApi.fetchData<ListClassicReturn<Podcast>>({
    api: 0,
    path: "podcast/search",
    parameters: {
      emissionId: props.emission.emissionId,
      size: nb,
      includeStatus: ["READY", "PROCESSING"],
    },
    specialTreatement: true,
  });
  if (0 === data.count) {
    activeEmission.value = false;
  }
  podcasts.value = data.result;
}
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
