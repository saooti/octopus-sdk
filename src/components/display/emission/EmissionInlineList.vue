<template>
  <div class="d-flex flex-column p-3 list-episode">
    <ClassicLoading
      :loading-text="loading ? t('Loading emissions ...') : undefined"
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
      class="btn btn-primary align-self-center w-fit-content m-4"
    >
      {{ buttonText }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import SwiperList from "../list/SwiperList.vue";
import classicApi from "../../../api/classicApi";
import EmissionPlayerItem from "./EmissionPlayerItem.vue";
import { state } from "../../../stores/ParamSdkStore";
import {useErrorHandler} from "../../composable/useErrorHandler";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { Emission } from "@/stores/class/general/emission";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { computed, onMounted, Ref, ref } from "vue";
import { AxiosError } from "axios";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  organisationId: { default: undefined, type: String },
    href: { default: undefined, type: String },
    buttonText: { default: undefined, type: String },
    rubriqueId: { default: undefined, type: Number },
    rubriquageId: { default: undefined, type: Number },
    nbPodcasts: { default: undefined, type: Number },
    itemSize: { default: undefined, type: Number },
})


//Data 
const loading = ref(true);
const allEmissions: Ref<Array<Emission>> = ref([]);
const rubriques: Ref<Array<Rubrique> | undefined> = ref(undefined);


//Composables
const { t } = useI18n();
const {handle403} = useErrorHandler();


//Computed
const displayRubriquage = computed(() => state.emissionsPage.rubriquage);
 
onMounted(()=>{
  fetchNext();
  if (displayRubriquage.value) {
    fetchRubriques();
  }
})

//Methods
async function fetchNext(): Promise<void> {
  try {
    const data = await classicApi.fetchData<ListClassicReturn<Emission>>({
      api: 0,
      path: "emission/search",
      parameters: {
        first: 0,
        size: 12,
        organisationId: props.organisationId,
        rubriqueId: props.rubriqueId ? [props.rubriqueId] : [],
        rubriquageId: props.rubriquageId ? [props.rubriquageId] : [],
        sort: "LAST_PODCAST_DESC",
      },
      specialTreatement: true,
    });
    allEmissions.value = allEmissions.value.concat(
      data.result.filter((em: Emission | null) => null !== em),
    );
    loading.value = false;
  } catch (error) {
    handle403(error as AxiosError);
  }
}
async function fetchRubriques(): Promise<void> {
  const data = await classicApi.fetchData<Rubriquage>({
    api: 0,
    path: "rubriquage/" + displayRubriquage.value,
  });
  rubriques.value = data.rubriques;
}
function rubriquesId(emission: Emission): string | undefined {
  if (
    !displayRubriquage.value ||
    !emission.rubriqueIds ||
    0 === emission.rubriqueIds.length ||
    !rubriques.value ||
    !rubriques.value.length
  )
    return undefined;
  const rubrique = rubriques.value.find(
    (element: Rubrique) =>
      element.rubriqueId &&
      emission.rubriqueIds.includes(element.rubriqueId) &&
      element.rubriquageId === displayRubriquage.value,
  );
  if (rubrique) {
    return rubrique.name;
  }
}
function mainRubriquage(emission: Emission): string {
  return state.emissionsPage.mainRubrique &&
    emission.rubriqueIds?.includes(state.emissionsPage.mainRubrique)
    ? "partenaireRubrique"
    : "";
}
</script>

<style lang="scss">
.octopus-app {
  .list-episode {
    padding: 2rem 0 1rem !important;

    @media (width <= 450px) {
      padding: 0.5rem 0 1rem !important;
    }

    h2 {
      margin-bottom: 1rem;
    }
  }
}
</style>
