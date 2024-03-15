<template>
  <div v-if="isPresent" class="d-flex flex-column comment-input-container mt-3">
    <strong
      v-if="knownIdentity && !editName"
      class="h6 mt-1 c-hand"
      @click="changeIdentity"
      >{{ knownIdentity }}</strong
    >
    <div v-if="editName" class="d-flex">
      <div class="d-flex flex-column">
        <input
          v-model="temporaryName"
          class="h6 mt-1"
          type="text"
          :class="{ 'border border-danger': 0 === countName || !validName }"
        />
        <p
          class="d-flex justify-content-end h6 mb-0"
          :class="{ 'text-danger': !validName }"
        >
          {{ countName + " / " + maxName }}
        </p>
      </div>
      <button class="btn m-1" @click="editName = false">
        {{ $t("Cancel") }}
      </button>
      <button
        class="btn btn-primary m-1"
        :disabled="0 === countName || !validName"
        @click="validEdit"
      >
        {{ $t("Validate") }}
      </button>
    </div>
    <textarea
      ref="textarea"
      v-model="newComment"
      :placeholder="placeholder"
      max-rows="10"
      :class="{ short: isOneLine && !newComment.includes('\n') }"
      @focus="textareaFocus = true"
      @blur="textareaFocus = false"
    />
    <template v-if="textareaFocus">
      <p
        class="d-flex justify-content-end h6"
        :class="{ 'text-danger': !validComment }"
      >
        {{ countComment + " / " + maxComment }}
      </p>
      <div class="d-flex justify-content-end mt-1">
        <button class="btn me-2" @mousedown="cancelAction">
          {{ $t("Cancel") }}
        </button>
        <button
          class="btn btn-primary"
          :disabled="0 === countComment || !validComment"
          @mousedown="requestToSend"
        >
          {{ placeholder }}
        </button>
      </div>
    </template>
    <AddCommentModal
      v-if="checkIdentityModal"
      @validate="postComment"
      @close="checkIdentityModal = false"
    />
    <MessageModal
      v-if="postError"
      :validatetext="$t('Close')"
      :title="$t('Error')"
      :message="$t('Error occurs while post your comment...')"
      @close="postError = false"
      @validate="postError = false"
    />
  </div>
</template>

<script lang="ts">
import octopusApi from "@saooti/octopus-api";
import crudApi from "@/api/classicCrud";
import cookies from "../../mixins/cookies";
import { state } from "../../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Conference } from "@/stores/class/conference/conference";
import { CommentPodcast } from "@/stores/class/general/comment";
import Constants from "../../../../public/config";
import { usePlayerStore } from "@/stores/PlayerStore";
import { useAuthStore } from "@/stores/AuthStore";
import { mapState } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
const AddCommentModal = defineAsyncComponent(
  () => import("./AddCommentModal.vue"),
);
const MessageModal = defineAsyncComponent(
  () => import("../../misc/modal/MessageModal.vue"),
);
export default defineComponent({
  name: "CommentInput",
  components: {
    AddCommentModal,
    MessageModal,
  },
  mixins: [cookies],

  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
    knownIdentity: { default: undefined, type: String },
    focus: { default: false, type: Boolean },
    comment: { default: undefined, type: Object as () => CommentPodcast },
    fetchConference: { default: undefined, type: Object as () => Conference },
  },
  emits: ["update:knownIdentity", "cancelAction", "newComment"],

  data() {
    return {
      newComment: "" as string,
      textareaFocus: false as boolean,
      checkIdentityModal: false as boolean,
      postError: false as boolean,
      isOneLine: true as boolean,
      editName: false as boolean,
      temporaryName: "" as string,
      maxComment: Constants.MAX_COMMENT as number,
      maxName: Constants.MAX_COMMENT_NAME as number,
    };
  },

  computed: {
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerLive",
      "playerElapsed",
      "playerTotal",
    ]),
    ...mapState(useAuthStore, ["authProfile"]),
    validName(): boolean {
      return this.countName <= this.maxName;
    },
    countName(): number {
      return this.temporaryName.length;
    },
    validComment(): boolean {
      return this.countComment <= this.maxComment;
    },
    countComment(): number {
      return this.newComment.length;
    },
    isPresent(): boolean {
      if (!this.podcast) return true;
      let podcastComment = this.podcast.annotations?.COMMENTS ?? "INHERIT";
      let organisationComment =
        this.podcast.organisation.comments ?? "LIVE_ONLY";
      return !(
        ("LIVE_ONLY" === podcastComment &&
          "READY_TO_RECORD" !== this.podcast.processingStatus) ||
        ("INHERIT" === podcastComment &&
          "LIVE_ONLY" === organisationComment &&
          "READY_TO_RECORD" !== this.podcast.processingStatus)
      );
    },
    placeholder(): string {
      return this.comment?.comId
        ? this.$t("Answer a comment")
        : this.$t("Write a comment");
    },
    isCertified(): boolean {
      return (
        (true === state.generalParameters.isCommments &&
          state.generalParameters.organisationId === this.podcastOrga) ||
        true === state.generalParameters.isAdmin
      );
    },
    phase(): string | undefined {
      if (undefined === this.podcast) {
        return this.comment ? this.comment.phase : undefined;
      }
      if (
        !this.podcast.conferenceId ||
        0 === this.podcast.conferenceId ||
        "READY_TO_RECORD" !== this.podcast.processingStatus
      )
        return "Podcast";
      if (
        this.fetchConference &&
        ("PLANNED" === this.fetchConference.status ||
          "PENDING" === this.fetchConference.status)
      )
        return "Prelive";
      return "Live";
    },
    podcastOrga(): string | undefined {
      const commentOrga = this.comment?.organisationId ?? "";
      return this.podcast?.organisation.id ?? commentOrga;
    },
  },
  watch: {
    textareaFocus(): void {
      this.newComment = this.newComment.trim();
    },
    focus(): void {
      (this.$refs.textarea as HTMLElement).focus();
    },
    newComment(): void {
      const padding =
        1.5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      this.isOneLine =
        (this.$refs.textarea as HTMLElement).clientWidth -
          this.inputExceeded(
            this.newComment,
            "18px Montserrat, sans-serif, Helvetica Neue",
          ) >
        padding;
    },
  },
  methods: {
    changeIdentity(): void {
      if (!this.knownIdentity) {
        return;
      }
      this.temporaryName = this.knownIdentity;
      this.editName = true;
    },
    validEdit(): void {
      this.setCookie("comment-octopus-name", this.temporaryName);
      this.$emit("update:knownIdentity", this.temporaryName);
      this.editName = false;
    },
    inputExceeded(text: string, font: string): number {
      const context = document.createElement("canvas").getContext("2d");
      if (null === context) {
        return 0;
      }
      context.font = font;
      return context.measureText(text).width;
    },
    requestToSend(): void {
      if (this.knownIdentity) {
        this.postComment();
      } else {
        this.checkIdentityModal = true;
      }
    },
    cancelAction(): void {
      this.$emit("cancelAction");
    },
    defineTimelineValue(): number {
      let timeline = 0;
      if (
        undefined !== this.podcast &&
        (this.playerPodcast?.podcastId === this.podcast.podcastId ||
          this.playerLive?.podcastId === this.podcast.podcastId)
      ) {
        timeline = Math.round(this.playerElapsed * this.playerTotal);
        if (this.podcast.duration && this.playerPodcast) {
          timeline = Math.round(
            timeline - (this.playerTotal - this.podcast.duration / 1000),
          );
        }
      }
      return timeline < 0 ? 0 : timeline;
    },
    async postComment(name?: string): Promise<void> {
      if (name) {
        this.setCookie("comment-octopus-name", name);
        this.$emit("update:knownIdentity", name);
      }
      const sendName = name ?? this.knownIdentity;
      const commentPodcastId = this.comment?.podcastId ?? 0;
      const comment: CommentPodcast = {
        content: this.newComment,
        name: sendName ?? "",
        podcastId: this.podcast?.podcastId ?? commentPodcastId,
        timeline: this.defineTimelineValue(),
        organisationId: this.podcastOrga,
        commentIdReferer: this.comment?.comId,
        certified: this.isCertified,
        userId: this.authProfile?.userId,
        phase: this.phase,
      };
      try {
        let data;
        if (this.isCertified) {
          comment.status = "Valid";
          data = await crudApi.postData<CommentPodcast>(
            2,
            "registeredComment/" + comment.userId,
            { ...comment, ...{ userId: undefined } },
          );
        } else {
          data = await octopusApi.postDataPublic<CommentPodcast>(
            2,
            "unregisteredComment",
            comment,
          );
        }
        this.$emit("newComment", data);
        this.newComment = "";
      } catch (error) {
        this.postError = true;
      }
      this.checkIdentityModal = false;
    },
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  .comment-input-container {
    textarea::placeholder {
      color: $octopus-primary-color;
    }
    textarea:focus::placeholder {
      color: black;
    }
    textarea {
      border-top: 0;
      border-right: 0;
      border-left: 0;
      border-bottom: 0.1rem solid #ddd !important;
      overflow: hidden !important;
      box-shadow: unset !important;
      background: transparent !important;
      height: 50px;
      resize: none;
      &.short {
        max-height: 38px;
      }
    }
  }
}
</style>
