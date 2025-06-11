<template>
  <section class="page-box">
    <template v-if="loaded && !error && participant">
      <h1>
        {{ $t("Animator") }}
      </h1>
      <section class="d-flex flex-column align-items-center mb-3">
        <img
          v-lazy="useProxyImageUrl(participant.imageUrl, '200')"
          width="200"
          height="200"
          role="presentation"
          
          :title="$t('Animator image', { name: name })"
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
        <EditBox
          v-if="editRight && pageParameters.isEditBox"
          :participant="participant"
          class="w-100 justify-content-center"
          @participant-update="updateParticipant"
        />
        <ShareSocialsButtons
          v-if="pageParameters.isShareButtons"
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
        :participant-id="participantId"
        :name="name"
        :category-filter="true"
        :productor-id="['']"
        :reload="reload"
        :show-count="true"
      />
    </template>
    <ClassicLoading
      :loading-text="!loaded ? $t('Loading content ...') : undefined"
      :error-text="error ? $t(`Animator doesn't exist`) : undefined"
    />
  </section>
</template>

<script lang="ts">
import classicApi from "../../api/classicApi";
import { state } from "../../stores/ParamSdkStore";
import { useApiStore } from "../../stores/ApiStore";
import { useFilterStore } from "../../stores/FilterStore";
import displayHelper from "../../helper/displayHelper";
import {useSeoTitleUrl} from "../composable/route/useSeoTitleUrl";
import {useImageProxy} from "../composable/useImageProxy";
import {useOrgaComputed} from "../composable/useOrgaComputed";
import {useErrorHandler} from "../composable/useErrorHandler";
import { Participant } from "@/stores/class/general/participant";
import ClassicLoading from "../form/ClassicLoading.vue";
import { defineComponent, defineAsyncComponent } from "vue";
import { AxiosError } from "axios";
import { mapState } from "pinia";
const ShareSocialsButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareSocialsButtons.vue"),
);
const PodcastFilterList = defineAsyncComponent(
  () => import("../display/podcasts/PodcastFilterList.vue"),
);
const EditBox = defineAsyncComponent(
  () => import("@/components/display/edit/EditBox.vue"),
);
const ShareAnonymous = defineAsyncComponent(() => import("../display/sharing/ShareAnonymous.vue"));
export default defineComponent({
  components: {
    ShareSocialsButtons,
    PodcastFilterList,
    EditBox,
    ClassicLoading,
    ShareAnonymous
  },
  props: {
    participantId: { default: undefined, type: Number },
  },
  setup(){
    const { useProxyImageUrl } = useImageProxy();
    const {  isEditRights } = useOrgaComputed();
    const { updatePathParams } = useSeoTitleUrl();
    const {handle403} = useErrorHandler();
    return { useProxyImageUrl, isEditRights, updatePathParams, handle403 }
  },
  data() {
    return {
      loaded: false as boolean,
      participant: undefined as Participant | undefined,
      error: false as boolean,
      reload: false as boolean,
    };
  },
  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    ...mapState(useApiStore, ["apiUrl"]),
    pageParameters() {
      return {
        isEditBox: !state.generalParameters.podcastmaker as boolean,
        isShareButtons: state.podcastPage.ShareButtons as boolean,
      };
    },
    rssUrl(): string {
      return `${this.apiUrl}rss/participant/${this.participantId}`;
    },
    description(): string {
      return this.participant?.description ?? "";
    },
    name(): string {
      return `${this.participant?.firstName ?? ""} ${
        this.participant?.lastName ?? ""
      }`.trim();
    },
    editRight(): boolean {
      return this.isEditRights(this.participant?.orga?.id);
    },
  },
  watch: {
    participant: {
      deep: true,
      handler() {
        this.reload = !this.reload;
      },
    },
    participantId: {
      immediate: true,
      handler() {
        this.getParticipantDetails();
      },
    },
  },
  methods: {
    urlify(text:string|undefined){
      return displayHelper.urlify(text);
    },
    initError(): void {
      this.error = true;
      this.loaded = true;
    },
    async getParticipantDetails(): Promise<void> {
      this.loaded = false;
      try {
        const data = await classicApi.fetchData<Participant>({
          api: 0,
          path: "participant/" + this.participantId,
        });
        if (
          "PUBLIC" !== data?.orga?.privacy &&
          this.filterOrgaId !== data?.orga?.id &&
          this.$route.query.productor !== data?.orga?.id
        ) {
          this.initError();
          return;
        }
        this.updateParticipant(data);
        this.loaded = true;
      } catch (error) {
        this.handle403(error as AxiosError);
        this.initError();
      }
    },
    updateParticipant(participant: Participant): void {
      this.participant = participant;
      this.updatePathParams(this.name);
    },
  },
});
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
