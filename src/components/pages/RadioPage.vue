<template>
  <section class="page-box">
    <template v-if="loaded && !error && radio">
      <PodcastmakerHeader
        v-if="isPodcastmaker"
        :page-title="$t('Radio')"
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
          <EditBoxRadio v-if="editRight" :radio="radio" />
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
      :loading-text="!loaded ? $t('Loading content ...') : undefined"
      :error-text="error ? $t(`Emission doesn't exist`) : undefined"
    />
  </section>
</template>

<script lang="ts">
import { useGeneralStore } from "../../stores/GeneralStore";
import { mapActions, mapState } from "pinia";
import classicApi from "../../api/classicApi";
import {useSeoTitleUrl} from "../composable/route/useSeoTitleUrl";
import {useOrgaComputed} from "../composable/useOrgaComputed";
import {useErrorHandler} from "../composable/useErrorHandler";
import ClassicLoading from "../form/ClassicLoading.vue";
import { defineComponent, defineAsyncComponent } from "vue";
import { AxiosError } from "axios";
import { Canal } from "@/stores/class/radio/canal";
import { useAuthStore } from "../../stores/AuthStore";
const SharePlayerRadio = defineAsyncComponent(
  () => import("../display/sharing/SharePlayerRadio.vue"),
);
const ShareSocialsButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareSocialsButtons.vue"),
);
const EditBoxRadio = defineAsyncComponent(
  () => import("@/components/display/edit/EditBoxRadio.vue"),
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
export default defineComponent({
  components: {
    SharePlayerRadio,
    ShareSocialsButtons,
    EditBoxRadio,
    ClassicLoading,
    RadioCurrently,
    RadioImage,
    RadioPlanning,
    PodcastmakerHeader,
    ShareAnonymous
  },
  props: {
    canalId: { default: undefined, type: Number },
  },
  setup(){
    const { isPodcastmaker, isEditRights, authOrgaId } = useOrgaComputed();
    const { updatePathParams } = useSeoTitleUrl();
    const {handle403} = useErrorHandler();
    return { isPodcastmaker, isEditRights, authOrgaId, updatePathParams, handle403}
  },
  data() {
    return {
      loaded: false as boolean,
      radio: undefined as Canal | undefined,
      error: false as boolean,
    };
  },

  computed: {
    ...mapState(useAuthStore, ["isRoleRadio"]),
    editRight(): boolean {
      return this.isEditRights(this.radio?.organisationId, this.isRoleRadio);
    },
  },
  watch: {
    canalId: {
      immediate: true,
      handler() {
        this.getRadioDetails();
      },
    },
  },
  beforeUnmount() {
    this.contentToDisplayUpdate(null);
  },
  methods: {
    ...mapActions(useGeneralStore, ["contentToDisplayUpdate"]),
    async getRadioDetails(): Promise<void> {
      this.loaded = false;
      this.error = false;
      try {
        this.radio = await classicApi.fetchData<Canal>({
          api: 14,
          path: "canal/" + this.canalId,
        });
        this.contentToDisplayUpdate(this.radio);
        this.updatePathParams(this.radio.name);
      } catch (error) {
        this.handle403(error as AxiosError);
        this.error = true;
      }
      this.loaded = true;
    },
  },
});
</script>
