<template>
  <section class="page-box">
    <template v-if="loaded && !error && participant">
      <h1>
        {{ t("Animator") }}
      </h1>
      <section class="d-flex flex-column align-items-center mb-3">
        <img
          v-lazy="useProxyImageUrl(participant.imageUrl, '200')"
          width="200"
          height="200"
          aria-hidden="true"
          alt=""
          :title="t('Animator image', { name: name })"
          class="img-box mb-3"
        />
        <h2 class="text-capitalize">
          {{ name }}
        </h2>
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="participant-desc html-wysiwyg-content"
          v-html="urlify(description)"
        />
        <!-- eslint-enable -->
        <slot
          v-if="editRight && !state.generalParameters.podcastmaker"
          name="edit-box"
          :participant="participant"
          :on-updated="updateParticipant"
        />
        <ShareSocialsButtons
          v-if="state.podcastPage.ShareButtons"
          class="w-100"
          :organisation-id="participant.orga.id"
        >
        <template #additional-buttons>
          <ShareAnonymous 
            :participant-id="participant.participantId" 
            :organisation-id="participant.orga.id"
            relative-class=""
            btn-class="btn share-btn mb-2 text-dark me-2"
          />
        </template>
        </ShareSocialsButtons>
      </section>
      <!-- productorId define to avoid overwrite #12817 -->
      <PodcastFilterList
        v-if="isInit"
        v-model:query="searchPattern"
        :first="paginateFirst"
        :size="ps"
        :participant-id="participantId"
        :name="name"
        :category-filter="true"
        :productor-id="['']"
        :reload="reload"
        :show-count="true"
        :force-update-parameters="true"
      />
    </template>
    <ClassicLoading
      :loading-text="!loaded ? t('Loading content ...') : undefined"
      :error-text="error ? t(`Animator doesn't exist`) : undefined"
    />
  </section>
</template>

<script setup lang="ts">
import classicApi from "../../api/classicApi";
import { state } from "../../stores/ParamSdkStore";
import { useFilterStore } from "../../stores/FilterStore";
import displayHelper from "../../helper/displayHelper";
import {useSeoTitleUrl} from "../composable/route/useSeoTitleUrl";
import {useImageProxy} from "../composable/useImageProxy";
import {useOrgaComputed} from "../composable/useOrgaComputed";
import {useErrorHandler} from "../composable/useErrorHandler";
import { Participant } from "@/stores/class/general/participant";
import ClassicLoading from "../form/ClassicLoading.vue";
import { computed, defineAsyncComponent, ref, Ref, watch } from "vue";
import { AxiosError } from "axios";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useSimplePageParam } from "../composable/route/useSimplePageParam";
const ShareSocialsButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareSocialsButtons.vue"),
);
const PodcastFilterList = defineAsyncComponent(
  () => import("../display/podcasts/PodcastFilterList.vue"),
);
const ShareAnonymous = defineAsyncComponent(() => import("../display/sharing/ShareAnonymous.vue"));


//Props
const props = defineProps({
  participantId: { default: undefined, type: Number },
  pr: { default: 0, type: Number },
  ps: { default: 30, type: Number },
  routeQuery: { default: "", type: String },
});


//Data
const loaded = ref(false);
const error = ref(false);
const reload = ref(false);
const participant: Ref<Participant | undefined> = ref(undefined);


//Composables
const route = useRoute();
const { t } = useI18n();
const { useProxyImageUrl } = useImageProxy();
const {  isEditRights } = useOrgaComputed();
const { updatePathParams } = useSeoTitleUrl();
const {handle403} = useErrorHandler();
const filterStore = useFilterStore();
const {
  searchPattern,
  paginateFirst,
  isInit
} = useSimplePageParam(props, true);


//Computed
const description = computed(() =>participant.value?.description ?? "");
const name = computed(() =>`${participant.value?.firstName ?? ""} ${participant.value?.lastName ?? ""}`.trim());
const editRight = computed(() =>isEditRights(participant.value?.orga?.id));


//Watch
watch(participant, () => {reload.value = !reload.value}, {deep: true});
watch(()=>props.participantId, () =>getParticipantDetails(), {immediate: true});



//Methods
function urlify(text:string|undefined){
  return displayHelper.urlify(text);
}
function  initError(): void {
  error.value = true;
  loaded.value = true;
}
async function getParticipantDetails(): Promise<void> {
  loaded.value = false;
  try {
    const data = await classicApi.fetchData<Participant>({
      api: 0,
      path: "participant/" + props.participantId,
    });
    if (
      "PUBLIC" !== data?.orga?.privacy &&
      filterStore.filterOrgaId !== data?.orga?.id &&
      route.query.productor !== data?.orga?.id
    ) {
      initError();
      return;
    }
    updateParticipant(data);
    loaded.value = true;
  } catch (error) {
    handle403(error as AxiosError);
    initError();
  }
}
function updateParticipant(participantUpdated: Participant): void {
  participant.value = participantUpdated;
  updatePathParams(name.value);
}
</script>

<style lang="scss">
.octopus-app {
  @media (width >= 950px) {
    .participant-desc {
      max-width: 50%;
      line-height: 1.5em;
    }
  }
}
</style>
