<template>
  <section v-if="displayLiveList" class="d-flex flex-column align-items-start mt-3">
    <div
      class="d-flex justify-content-between flex-grow-1 mb-3 w-100 align-items-center"
    >
      <h2 class="mb-0">
        {{ t("Live") }}
      </h2>
      <router-link
        v-if="liveRight && !isPodcastmaker"
        to="/main/priv/edit/live"
      >
        <button class="btn btn-primary">
          {{ t("Launch a new live") }}
        </button>
      </router-link>
    </div>
    <ClassicSelect
      v-if="lives.length || 'ALL' !== selectedStatus"
      v-model:text-init="selectedStatus"
      id-select="status-live-chooser-select"
      :label="t('Selection by status')"
      :display-label="false"
      :options="statusArraySelect"
      class="mb-3"
    />
    <ClassicLoading
      :loading-text="loading ? t('Loading lives...') : undefined"
      :error-text="0 === lives.length ? t('No live currently') : undefined"
    />
    <template v-if="lives.length">
      <SwiperList v-if="!loading" :list-object="lives">
        <template #octopusSlide="{ option, index }">
          <LiveItem
            :fetch-conference="option"
            @delete-item="deleteLive(index)"
            @update-item="updateLive($event, index)"
          />
        </template>
      </SwiperList>
    </template>
  </section>
</template>

<script setup lang="ts">
import ClassicLoading from "../../form/ClassicLoading.vue";
import LiveItem from "./LiveItem.vue";
import ClassicSelect from "../../form/ClassicSelect.vue";
import SwiperList from "../list/SwiperList.vue";
import {useErrorHandler} from "../../composable/useErrorHandler";
import {useOrgaComputed} from "../../composable/useOrgaComputed";
import classicApi from "../../../api/classicApi";
import { useAuthStore } from "../../../stores/AuthStore";
import { useFilterStore } from "../../../stores/FilterStore";
import { Conference } from "@/stores/class/conference/conference";
import { computed, Ref, ref, watch } from "vue";
import { AxiosError } from "axios";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  organisationId: { default: undefined, type: String },
  hideIfEmpty: { default: false, type: Boolean },
})

//Data 
const loading = ref(true);
const loaded = ref(true);
const lives: Ref<Array<Conference>> = ref([]);
const isLiveAuthorized = ref(false);
const statusClassic= ref(["RECORDING", "PENDING", "PLANNED"]);
const statusAdmin = ref(["DEBRIEFING", "ERROR", "PUBLISHING"]);
const selectedStatus = ref("ALL");


//Composables
const { t } = useI18n();
const { isPodcastmaker, isEditRights } = useOrgaComputed();
const {handle403} = useErrorHandler();
const authStore = useAuthStore();
const filterStore = useFilterStore();
const saveFetchStore = useSaveFetchStore();


//Computed
const displayLiveList = computed(() => {
  return (
    (undefined !== filterStore.filterOrgaId ||
      undefined !== props.organisationId) &&
    (!props.hideIfEmpty || (props.hideIfEmpty && 0 !== lives.value.length))
  );
});
const filterOrgaUsed = computed(() => {
  return filterStore.filterOrgaId ? filterStore.filterOrgaId : props.organisationId;
});
const editRight = computed(() => {
  return isEditRights(filterOrgaUsed.value);
});
const liveRight = computed(() => {
  return (
    authStore.isRoleLive &&
    "true" === authStore.authOrganisation.attributes?.["live.active"]
  );
});
const statusArraySelect = computed(() => {
  const statusArray = [{ title: t("All lives"), value: "ALL" }];
      for (const status of statusFetched.value) {
        let title = "";
        switch (status) {
          case "RECORDING":
            title = t("In live");
            break;
          case "PENDING":
            title = t("live upcoming");
            break;
          case "PLANNED":
            title = t("live in few time");
            break;
          case "DEBRIEFING":
            title = t("In debriefing");
            break;
          case "PUBLISHING":
            title = t("In the process of being published");
            break;
          case "ERROR":
            title = t("In error");
            break;
          default:
            break;
        }
        statusArray.push({ title: title, value: status });
      }
      return statusArray;
});
const statusFetched = computed(() => {
  if (editRight.value) {
    return statusClassic.value.concat(statusAdmin.value);
  }
  return statusClassic.value;
});


//Watch
watch(filterOrgaUsed, async () => {
  await checkIfLiveAuthorized();
  fetchContent();
}, {immediate: true});
watch(selectedStatus, () => fetchContent());


//Methods
async function checkIfLiveAuthorized(): Promise<void> {
  if (!filterOrgaUsed.value) {
    return;
  }
  isLiveAuthorized.value = await saveFetchStore.getOrgaLiveEnabled(
    filterOrgaUsed.value,
  );
}
function endLoading(): void {
  loading.value = false;
  loaded.value = true;
}
function updateLive(live: Conference, index: number): void {
  lives.value.splice(index, 1, live);
}
async function fetchContent(): Promise<void> {
  lives.value.length = 0;
  if (!filterOrgaUsed.value || !isLiveAuthorized.value) {
    endLoading();
    return;
  }
  loading.value = true;
  loaded.value = false;
  try {
    const dataLives = await classicApi.fetchData<Array<Conference>>({
      api: 9,
      path: "conference/list",
      parameters: {
        organisationId: filterOrgaUsed.value,
        withPodcastId: true,
        status:
          "ALL" === selectedStatus.value
            ? statusFetched.value
            : selectedStatus.value,
      },
    });
    lives.value = dataLives.filter((p: Conference | null) => {
      return null !== p;
    });
  } catch (error) {
    handle403(error as AxiosError);
  }
  endLoading();
}
function deleteLive(index: number): void {
  lives.value.splice(index, 1);
}
</script>
