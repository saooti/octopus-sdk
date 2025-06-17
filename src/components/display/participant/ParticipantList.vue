<template>
  <ListPaginate
    id="participantListPaginate"
    v-model:first="dfirst"
    v-model:rows-per-page="dsize"
    v-model:is-mobile="isMobile"
    :text-count="
      showCount && displayCount > 1
        ? `${t('Number participants', { nb: displayCount })} ${t(
            'sort by score',
          )}`
        : undefined
    "
    :total-count="totalCount"
    :loading="loading"
    :loading-text="loading ? t('Loading participants ...') : undefined"
    :player-responsive="true"
  >
    <template #list>
      <div class="octopus-element-list">
        <ClassicLazy
          v-for="p in displayArray"
          :key="p.participantId"
          :min-height="360"
        >
          <ParticipantItem v-if="0 !== p.participantId" :participant="p" />
          <template #preview>
            <router-link
              :to="{
                name: 'participant',
                params: { participantId: p.participantId },
              }"
              :title="t('Participant name page', { name: p.lastName })"
            >
              {{ p.lastName }}
            </router-link>
          </template>
        </ClassicLazy>
      </div>
    </template>
  </ListPaginate>
</template>

<script setup lang="ts">
import ListPaginate from "../list/ListPaginate.vue";
import ClassicLazy from "../../misc/ClassicLazy.vue";
import {useErrorHandler} from "../../composable/useErrorHandler";
import classicApi from "../../../api/classicApi";
import ParticipantItem from "./ParticipantItem.vue";
import { useFilterStore } from "../../../stores/FilterStore";
import {
  Participant,
  emptyParticipantData,
} from "@/stores/class/general/participant";
import { computed, onBeforeMount, Ref, ref, watch } from "vue";
import { AxiosError } from "axios";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  first: { default: 0, type: Number },
  size: { default: 30, type: Number },
  query: { default: undefined, type: String },
  organisationId: { default: undefined, type: String },
  showCount: { default: false, type: Boolean },
})


//Data 
const loading = ref(true);
const dfirst = ref(props.first);
const dsize = ref(props.size);
const totalCount = ref(0);
const displayCount = ref(0);
const isMobile = ref(false);
const participants: Ref<Array<Participant>> = ref([]);

//Composables
const { t } = useI18n();
const {handle403} = useErrorHandler();
const filterStore = useFilterStore();


//Computed
const organisation = computed(() => props.organisationId ? props.organisationId : filterStore.filterOrgaId);
const displayArray = computed(() => {
  if (isMobile.value) {
    return participants.value;
  }
  return participants.value.slice(
    dfirst.value,
    Math.min(dfirst.value + dsize.value, totalCount.value),
  );
});
const changePaginate = computed(() =>  `${props.first}|${props.size}`);
const sort = computed(() =>  !props.query ? "NAME" : "SCORE");


//Watch
watch(changePaginate, () => {
  dfirst.value = props.first;
  dsize.value = props.size;
});
watch(()=>props.query, () => reloadList());
watch(organisation, () => reloadList());
watch(dsize, () => reloadList());
watch(dfirst, () => {
  if (
    !participants.value[dfirst.value] ||
    0 === participants.value[dfirst.value].participantId
  ) {
    fetchContent(false);
  }
});

onBeforeMount(()=>fetchContent(true))


//Methods
function reloadList() {
  dfirst.value = 0;
  fetchContent(true);
}
async function fetchContent(reset: boolean): Promise<void> {
  loading.value = true;
  try {
    const data = await classicApi.fetchData<ListClassicReturn<Participant>>(
      {
        api: 0,
        path: "participant/search",
        parameters: {
          first: dfirst.value,
          size: dsize.value,
          query: props.query,
          organisationId: organisation.value,
          sort: sort.value
        },
        specialTreatement: true,
      },
    );
    if (reset) {
      participants.value.length = 0;
    }
    displayCount.value = data.count;
    if (dfirst.value > participants.value.length) {
      for (
        let i = participants.value.length - 1,
          len = dfirst.value + dsize.value;
        i < len;
        i++
      ) {
        participants.value.push(emptyParticipantData());
      }
    }
    const responseParticipants = data.result.filter(
      (p: Participant | null) => {
        if (null === p) {
          displayCount.value--;
        }
        return null !== p;
      },
    );
    participants.value = participants.value
      .slice(0, dfirst.value)
      .concat(responseParticipants)
      .concat(
        participants.value.slice(
          dfirst.value + dsize.value,
          participants.value.length,
        ),
      );
    totalCount.value = data.count;
  } catch (error) {
    handle403(error as AxiosError);
  }
  loading.value = false;
}
</script>
