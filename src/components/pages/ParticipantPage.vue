<template>
  <div class="page-box">
    <div v-if="loaded && !error">
      <h1>
        {{ $t("Animator") }}
      </h1>
      <div class="d-flex flex-column align-items-center mb-3">
        <img
          v-lazy="proxyImageUrl(participant.imageUrl, '200')"
          width="200"
          height="200"
          :title="$t('Animator image')"
          :alt="$t('Animator image')"
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
        <ShareButtons
          v-if="pageParameters.isShareButtons"
          class="w-100"
          :participant-id="participantId"
          :organisation-id="participant.orga.id"
        />
      </div>
      <!-- productorId define to avoid overwrite #12817 -->
      <PodcastFilterList
        :participant-id="participantId"
        :name="name"
        :category-filter="true"
        :productor-id="['']"
        :reload="reload"
        :show-count="true"
      />
    </div>
    <ClassicLoading
      :loading-text="!loaded ? $t('Loading content ...') : undefined"
      :error-text="error ? $t(`Animator doesn't exist`) : undefined"
    />
  </div>
</template>

<script lang="ts">
import classicApi from "../../api/classicApi";
import { state } from "../../stores/ParamSdkStore";
import { useApiStore } from "../../stores/ApiStore";
import displayMethods from "../mixins/displayMethods";
import imageProxy from "../mixins/imageProxy";
import { orgaComputed } from "../mixins/orgaComputed";
import { handle403 } from "../mixins/handle403";
import { Participant } from "@/stores/class/general/participant";
import ClassicLoading from "../form/ClassicLoading.vue";
import { defineComponent, defineAsyncComponent } from "vue";
import { AxiosError } from "axios";
import { mapState } from "pinia";
const ShareButtons = defineAsyncComponent(
  () => import("../display/sharing/ShareButtons.vue"),
);
const PodcastFilterList = defineAsyncComponent(
  () => import("../display/podcasts/PodcastFilterList.vue"),
);
const EditBox = defineAsyncComponent(
  () => import("@/components/display/edit/EditBox.vue"),
);
export default defineComponent({
  components: {
    ShareButtons,
    PodcastFilterList,
    EditBox,
    ClassicLoading,
  },
  mixins: [displayMethods, handle403, orgaComputed, imageProxy],
  props: {
    participantId: { default: undefined, type: Number },
  },
  emits: ["participantTitle"],
  data() {
    return {
      loaded: false as boolean,
      participant: undefined as Participant | undefined,
      error: false as boolean,
      reload: false as boolean,
    };
  },
  computed: {
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
      this.$emit("participantTitle", this.name);
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  @media (min-width: 950px) {
    .participant-desc {
      max-width: 50%;
      line-height: 1.5em;
    }
  }
}
</style>
