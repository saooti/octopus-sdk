<template>
  <ListPaginate
    id="emissionListPaginate"
    v-model:first="dfirst"
    v-model:rows-per-page="dsize"
    v-model:is-mobile="isMobile"
    :text-count="
      showCount && emissions.length > 1
        ? t('Number emissions', { nb: displayCount }) + sortText
        : undefined
    "
    :total-count="totalCount"
    :loading="loading"
    :loading-text="loading ? t('Loading emissions ...') : undefined"
    :player-responsive="true"
  >
    <template #list>
      <div v-if="!state.emissionsPage.itemPlayer" class="octopus-element-list two-items-list">
        <ClassicLazy
          v-for="e in displayArray"
          :key="e.emissionId"
          :min-height="250"
          class="d-flex flex-column flex-grow-1"
        >
          <EmissionItem v-if="0 !== e.emissionId" :emission="e" />
          <template #preview>
            <router-link
              :to="{
                name: 'emission',
                params: { emissionId: e.emissionId },
              }"
              :title="t('Series name page', { name: e.name })"
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

<script setup lang="ts">
import ListPaginate from "../list/ListPaginate.vue";
import classicApi from "../../../api/classicApi";
import ClassicLazy from "../../misc/ClassicLazy.vue";
import {useErrorHandler} from "../../composable/useErrorHandler";
import { state } from "../../../stores/ParamSdkStore";
import { Emission, emptyEmissionData } from "../../../stores/class/general/emission";
import { Rubrique } from "../../../stores/class/rubrique/rubrique";
import { defineAsyncComponent, ref, Ref, computed, watch, onMounted } from "vue";
import { FetchParam } from "../../../stores/class/general/fetchParam";
import { AxiosError } from "axios";
import { Rubriquage } from "../../../stores/class/rubrique/rubriquage";
import { useFilterStore } from "../../../stores/FilterStore";
import { ListClassicReturn } from "../../../stores/class/general/listReturn";
import { useI18n } from "vue-i18n";
import { EmissionGroup } from "../../../api/groupsApi";
const EmissionItem = defineAsyncComponent(() => import("./EmissionItem.vue"));
const EmissionPlayerItem = defineAsyncComponent(
  () => import("./EmissionPlayerItem.vue"),
);

//Props 
const props = defineProps({
  first: { default: 0, type: Number },
  size: { default: 30, type: Number },
  query: { default: undefined, type: String },
  iabId: { default: undefined, type: Number },
  organisationId: { default: undefined, type: String },
  monetisable: { default: "UNDEFINED", type: String },
  before: { default: undefined, type: String },
  after: { default: undefined, type: String },
  sort: { default: "DATE", type: String },
  showCount: { default: false, type: Boolean },
  includeHidden: { default: false, type: Boolean },
  rubriqueId: { default: () => [], type: Array as () => Array<number> },
  rubriquageId: { default: () => [], type: Array as () => Array<number> },
  noRubriquageId: { default: () => [], type: Array as () => Array<number> },
  nbPodcasts: { default: undefined, type: Number },
  /** The beneficiaries to filter on */
  beneficiaries: { default: null, type: Array as () => Array<string> },
  /** The emission groups to filter on */
  emissionGroups: { default: null, type: Array as () => Array<EmissionGroup> }
})

//Data 
const loading = ref(true);
const dfirst = ref(props.first);
const dsize = ref(props.size);
const totalCount = ref(0);
const displayCount = ref(0);
const isMobile = ref(false);
const emissions: Ref<Array<Emission>> = ref([]);
const rubriques: Ref<Array<Rubrique> | undefined> = ref(undefined);
  
//Composables
const { t } = useI18n();
const {handle403} = useErrorHandler();
const filterStore = useFilterStore();

//Computed
const displayArray = computed(() => {
  if (isMobile.value) {
    return emissions.value;
  }
  return emissions.value.slice(
    dfirst.value,
    Math.min(dfirst.value + dsize.value, totalCount.value),
  );
});
const displayRubriquage = computed(() => state.emissionsPage.rubriquage);
const changePaginate = computed(() => `${props.first}|${props.size}`);
/** Computed property to track for configuration changes */
const changed = computed(() => {
  return `${props.organisationId}|${props.query}|${props.monetisable}|${props.includeHidden}|\
  ${props.iabId}|${props.rubriqueId}|${props.rubriquageId}|${props.before}|\
  ${props.after}|${props.sort}|${props.noRubriquageId}|${props.beneficiaries}|\
  ${props.emissionGroups}`;
});
const sortText = computed(() => {
  let textSort = "";
  switch (props.sort) {
    case "SCORE":
      textSort = " " + t("sort by score");
      break;
    case "LAST_PODCAST_DESC":
      textSort = " " + t("sort by date");
      break;
    case "NAME":
      textSort = " " + t("sort by alphabetical");
      break;
    default:
      textSort = " " + t("sort by date");
      break;
  }
    return textSort.replace("triés", "triées");
});
const organisation = computed(() => props.organisationId ? props.organisationId : filterStore.filterOrgaId);


//Watch
watch(changePaginate, () => {
  dfirst.value = props.first;
  dsize.value = props.size;
});
watch(changed, () =>fetchContent(true));
watch(dsize, () =>fetchContent(true));
watch(dfirst, () =>{
  if (
    !emissions.value[dfirst.value] ||
    0 === emissions.value[dfirst.value].emissionId
  ) {
    fetchContent(false);
  }
});


onMounted(()=>{
  fetchContent(false);
  if (displayRubriquage.value) {
    fetchRubriques();
  }
})

//Methods
async function fetchContent(reset: boolean): Promise<void> {
  loading.value = true;
  const param: FetchParam = {
    first: reset? 0: dfirst.value,
    size: dsize.value,
    query: props.query,
    groupId: props.emissionGroups?.map(g => g.groupId),
    organisationId: organisation.value,
    monetisable: props.monetisable,
    iabId: props.iabId,
    before: props.before,
    after: props.after,
    sort: props.sort,
    noRubriquageId: props.noRubriquageId.length
      ? props.noRubriquageId
      : undefined,
    rubriqueId: props.rubriqueId.length ? props.rubriqueId : undefined,
    rubriquageId: props.rubriquageId.length ? props.rubriquageId : undefined,
    includeHidden: props.includeHidden,
    beneficiary: props.beneficiaries ?? undefined
  };

  // When fetching hidden episodes, also fetch hidden emissions
  if (props.includeHidden === true) {
    param.visible = 'ALL';
  } else {
    param.visible = 'VISIBLE';
  }

  // TODO use emissionGroups

  try {
    const data = await classicApi.fetchData<ListClassicReturn<Emission>>({
      api: 0,
      path: "emission/search",
      parameters: param,
      specialTreatement: true,
    });
    afterFetching(reset, data);
  } catch (error) {
    handle403(error as AxiosError);
  }
}
function afterFetching(
  reset: boolean,
  data: { count: number; result: Array<Emission>; sort: string },
): void {
  if (reset) {
    dfirst.value = 0;
    emissions.value.length = 0;
  }
  if (dfirst.value > emissions.value.length) {
    for (
      let i = emissions.value.length - 1, len = dfirst.value + dsize.value;
      i < len;
      i++
    ) {
      emissions.value.push(emptyEmissionData());
    }
  }
  displayCount.value = data.count;
  const responseEmissions = data.result.filter((e: Emission | null) => {
    if (null === e) {
      displayCount.value--;
    }
    return null !== e;
  });
  emissions.value = emissions.value
    .slice(0, dfirst.value)
    .concat(responseEmissions)
    .concat(
      emissions.value.slice(dfirst.value + dsize.value, emissions.value.length),
    );
  totalCount.value = data.count;
  loading.value = false;
}
async function fetchRubriques(): Promise<void> {
  const data = await classicApi.fetchData<Rubriquage>({
    api: 0,
    path: "rubriquage/" + displayRubriquage.value,
  });
  rubriques.value = data.rubriques;
}
function mainRubriquage(emission: Emission): string {
  return emission.rubriqueIds?.[0] === state.emissionsPage.mainRubrique
    ? "partenaireRubrique"
    : "";
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
    (element: Rubrique) => element.rubriqueId === emission.rubriqueIds[0],
  );
  if (!rubrique) {
    return undefined;
  }
  return rubrique.name;
}
</script>
