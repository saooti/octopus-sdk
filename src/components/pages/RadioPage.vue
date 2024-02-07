<template>
  <div class="page-box">
    <template v-if="loaded && !error">
      <PodcastmakerHeader
        v-if="isPodcastmaker"
        :page-title="$t('Radio')"
        :image-url="radio.imageUrl"
      />
      <div
        v-if="radio"
        class="d-flex flex-column page-element"
        :class="isPodcastmaker ? 'page-element-podcastmaker' : ''"
      >
        <div class="module-box">
          <div class="mb-5 descriptionText">
            <RadioImage :radio="radio" />
            <h2>{{ radio.name }}</h2>
            <div v-if="radio.description">
              {{ radio.description }}
            </div>
          </div>
          <RadioCurrently :radio="radio" />
          <EditBoxRadio v-if="editRight" :radio="radio" />
        </div>
        <RadioPlanning :radio="radio" />
        <SharePlayerRadio
          v-if="authenticated"
          :canal="radio"
          :organisation-id="myOrganisationId"
        />
        <ShareButtons :organisation-id="radio.organisationId" />
      </div>
    </template>
    <ClassicLoading
      :loading-text="!loaded ? $t('Loading content ...') : undefined"
      :error-text="error ? $t(`Emission doesn't exist`) : undefined"
    />
  </div>
</template>

<script lang="ts">
import { useGeneralStore } from "@/stores/GeneralStore";
import { mapActions } from "pinia";
import octopusApi from "@saooti/octopus-api";
import { state } from "../../stores/ParamSdkStore";
import displayMethods from "../mixins/displayMethods";
import imageProxy from "../mixins/imageProxy";
import { orgaComputed } from "../mixins/orgaComputed";
import { handle403 } from "../mixins/handle403";
import ClassicLoading from "../form/ClassicLoading.vue";
import { defineComponent, defineAsyncComponent } from "vue";
import { AxiosError } from "axios";
import { Canal } from "@/stores/class/radio/canal";
const SharePlayerRadio = defineAsyncComponent(
  () => import("../display/sharing/SharePlayerRadio.vue"),
);
const ShareButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareButtons.vue"),
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
export default defineComponent({
  components: {
    SharePlayerRadio,
    ShareButtons,
    EditBoxRadio,
    ClassicLoading,
    RadioCurrently,
    RadioImage,
    RadioPlanning,
    PodcastmakerHeader,
  },
  mixins: [displayMethods, handle403, orgaComputed, imageProxy],
  props: {
    canalId: { default: undefined, type: Number },
  },
  emits: ["radioTitle"],

  data() {
    return {
      loaded: false as boolean,
      radio: undefined as Canal | undefined,
      error: false as boolean,
    };
  },

  computed: {
    editRight(): boolean {
      return (
        (true === this.authenticated &&
          true === state.generalParameters.isRadio &&
          this.myOrganisationId === this.radio?.organisationId) ||
        true === state.generalParameters.isAdmin
      );
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
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
        this.radio = await octopusApi.fetchData<Canal>(
          14,
          "canal/" + this.canalId,
        );
        this.contentToDisplayUpdate(this.radio);
        this.$emit("radioTitle", this.radio.name);
      } catch (error) {
        this.handle403(error as AxiosError);
        this.error = true;
      }
      this.loaded = true;
    },
  },
});
</script>
