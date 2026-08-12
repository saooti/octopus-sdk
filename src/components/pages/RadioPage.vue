<template>
  <section class="page-box">
    <template v-if="loaded && !error && radio">
      <PodcastmakerHeader
        v-if="isPodcastmaker"
        :page-title="t('Radio')"
        :img-url="radio.imageUrl"
      />
      <div
        v-if="radio"
        class="d-flex flex-column page-element"
        :class="isPodcastmaker ? 'page-element-podcastmaker' : ''"
      >
        <section class="module-box">
          <div class="mb-5 description-text">
            <RadioImage :radio="radio" />
            <div class="d-flex align-items-center justify-content-between">
              <h2>{{ radio.name }}</h2>
              <ShareAnonymous class="d-flex justify-content-end flex-grow-1" :organisation-id="radio.organisationId"/>
            </div>
            <div v-if="radio.description">
              {{ radio.description }}
            </div>
          </div>
          <RadioCurrently :radio="radio" />
          <slot v-if="editRight" name="edit-box-radio" :radio="radio" />
        </section>
        <ShareSocialsButtons :organisation-id="radio.organisationId" />
        <RadioPlanning :radio="radio" />
        <SharePlayerRadio
          v-if="editRight"
          :canal="radio"
          :organisation-id="authOrgaId"
        />
      </div>
    </template>
    <ClassicLoading
      :loading-text="!loaded ? t('Loading content ...') : undefined"
      :error-text="error ? t(`Emission doesn't exist`) : undefined"
    />
  </section>
</template>

<script setup lang="ts">
import { useGeneralStore } from "../../stores/GeneralStore";
import classicApi from "../../api/classicApi";
import {useSeoTitleUrl} from "../composable/route/useSeoTitleUrl";
import {useOrgaComputed} from "../composable/useOrgaComputed";
import {useErrorHandler} from "../composable/useErrorHandler";
import ClassicLoading from "../form/ClassicLoading.vue";
import {  defineAsyncComponent, ref, Ref, computed, watch, onBeforeUnmount } from "vue";
import { AxiosError } from "axios";
import { Canal } from "@/stores/class/radio/canal";
import { useAuthStore } from "../../stores/AuthStore";
import { useI18n } from "vue-i18n";
const SharePlayerRadio = defineAsyncComponent(
  () => import("../display/sharing/SharePlayerRadio.vue"),
);
const ShareSocialsButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareSocialsButtons.vue"),
);
const RadioCurrently = defineAsyncComponent(
  () => import("../display/live/RadioCurrently.vue"),
);
const RadioImage = defineAsyncComponent(
  () => import("../display/live/RadioImage.vue"),
);
const RadioPlanning = defineAsyncComponent(
  () => import("../display/live/RadioPlanning.vue"),
);
const PodcastmakerHeader = defineAsyncComponent(
  () => import("../display/podcastmaker/PodcastmakerHeader.vue"),
);
const ShareAnonymous = defineAsyncComponent(() => import("../display/sharing/ShareAnonymous.vue"));
 
//Props 
const props = defineProps({
  canalId: { default: undefined, type: Number },
});


//Data 
const loaded = ref(false);
const error = ref(false);
const radio: Ref<Canal|undefined> = ref(undefined);


//Composables
const { t } = useI18n();
const { isPodcastmaker, isEditRights, authOrgaId } = useOrgaComputed();
const { updatePathParams } = useSeoTitleUrl();
const {handle403} = useErrorHandler();
const authStore = useAuthStore();
const generalStore = useGeneralStore();


//Computed
const editRight = computed(() =>isEditRights(radio.value?.organisationId, authStore.isRoleRadio));


//Watch
watch(()=>props.canalId, () => {getRadioDetails()}, {immediate: true});


onBeforeUnmount(() => {
  generalStore.contentToDisplayUpdate(null);
});


//Methods
async function getRadioDetails(): Promise<void> {
  loaded.value = false;
  loaded.value = false;
  try {
    radio.value = await classicApi.fetchData<Canal>({
      api: 14,
      path: "canal/" + props.canalId,
    });
    generalStore.contentToDisplayUpdate(radio.value);
    updatePathParams(radio.value.name);
  } catch (error) {
    handle403(error as AxiosError);
    loaded.value = true;
  }
  loaded.value = true;
}
</script>
