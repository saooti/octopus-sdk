<template>
  <div
    v-if="canAddComment"
    class="d-flex flex-column comment-input-container mt-3"
  >
    <CommentName v-if="commentUser?.name" />
    <ClassicContentEditable
      ref="textarea"
      v-model="newComment"
      class="comment-input"
      :placeholder="placeholder"
      @focus="isTextareaActive = true"
    />
    <div v-if="isTextareaActive" class="d-flex justify-content-between mt-1">
      <ClassicEmojiPicker
        popover-relative-class="page-element"
        @emoji-selected="addEmojiSelected"
      />
      <div class="d-flex ms-auto">
        <p
          class="d-flex justify-content-end h6 me-3"
          :class="{ 'text-danger': !commentTooLong }"
        >
          {{ countComment + " / " + maxComment }}
        </p>
        <button class="btn me-2" @mousedown="cancelAction">
          {{ $t("Cancel") }}
        </button>
        <button
          class="btn btn-primary"
          :disabled="0 === countComment || !commentTooLong"
          @mousedown="requestToSend"
        >
          {{ placeholder }}
        </button>
      </div>
    </div>
    <CheckIdentityModal
      v-if="isCheckIdentity"
      @validate="postComment"
      @close="isCheckIdentity = false"
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
import cookies from "../../mixins/cookies";
import { Podcast } from "@/stores/class/general/podcast";
import { CommentCreate, CommentPodcast } from "@/stores/class/general/comment";
import Constants from "../../../../public/config";
import { mapActions, mapState } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
import { useCommentStore } from "@/stores/CommentStore";
const CheckIdentityModal = defineAsyncComponent(
  () => import("./modal/CheckIdentityModal.vue"),
);
const CommentName = defineAsyncComponent(() => import("./CommentName.vue"));
const MessageModal = defineAsyncComponent(
  () => import("../../misc/modal/MessageModal.vue"),
);
const ClassicEmojiPicker = defineAsyncComponent(
  () => import("../../form/ClassicEmojiPicker.vue"),
);
const ClassicContentEditable = defineAsyncComponent(
  () => import("../../form/ClassicContentEditable.vue"),
);
export default defineComponent({
  name: "CommentInput",
  components: {
    CheckIdentityModal,
    MessageModal,
    ClassicEmojiPicker,
    ClassicContentEditable,
    CommentName,
  },
  mixins: [cookies],

  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
    focus: { default: false, type: Boolean },
    inAnswerComment: {
      default: undefined,
      type: Object as () => CommentPodcast,
    },
  },
  emits: ["cancelAction", "newComment"],

  data() {
    return {
      newComment: "" as string,
      maxComment: Constants.MAX_COMMENT as number,
      isTextareaActive: false as boolean,
      isCheckIdentity: false as boolean,
      postError: false as boolean,
    };
  },

  computed: {
    ...mapState(useCommentStore, ["commentUser"]),
    commentTooLong(): boolean {
      return this.countComment <= this.maxComment;
    },
    countComment(): number {
      return this.newComment.length;
    },
    placeholder(): string {
      return this.inAnswerComment?.commentId
        ? this.$t("Answer a comment")
        : this.$t("Write a comment");
    },
    canAddComment(): boolean {
      return true;
      //TODO
      /*  if (!this.podcast) return true;
      let podcastComment = this.podcast.annotations?.COMMENTS ?? "INHERIT";
      let organisationComment =
        this.podcast.organisation.comments ?? "LIVE_ONLY";
      return !(
        ("LIVE_ONLY" === podcastComment &&
          "READY_TO_RECORD" !== this.podcast.processingStatus) ||
        ("INHERIT" === podcastComment &&
          "LIVE_ONLY" === organisationComment &&
          "READY_TO_RECORD" !== this.podcast.processingStatus)
      ); */
    },
    /* isCertified(): boolean {
      return (
        (true === state.generalParameters.isCommments &&
          state.generalParameters.organisationId === this.podcastOrga) ||
        true === state.generalParameters.isAdmin
      );
    }, */
    /* phase(): string | undefined {
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
    }, */
  },
  watch: {
    focus(): void {
      (this.$refs.textarea as HTMLElement).focus();
    },
  },
  created() {
    this.initCommentUser();
  },
  methods: {
    //TODO trim comment ?
    ...mapActions(useCommentStore, ["initCommentUser"]),
    addEmojiSelected(emoji: string) {
      this.newComment += emoji;
    },
    requestToSend(): void {
      if (this.commentUser?.name) {
        this.postComment();
      } else {
        this.isCheckIdentity = true;
      }
    },
    cancelAction(): void {
      this.newComment = "";
      this.isTextareaActive = false;
      this.$emit("cancelAction");
    },
    async postComment(): Promise<void> {
      const comment: CommentCreate = {
        answerTo: this.inAnswerComment?.commentId,
        content: this.newComment,
        name: this.commentUser?.name ?? "",
        podcastId:
          this.podcast?.podcastId ?? this.inAnswerComment?.podcastId ?? 0,
        uuid: this.commentUser?.uuid ?? "",
        //TODO state ?
        state: "VALIDATED",
        //certified: this.isCertified,
        //timeline: this.defineTimelineValue(),
        //phase: this.phase,
      };
      try {
        //TODO auth et pas auth
        const commentReceived = await octopusApi.postDataPublic<CommentPodcast>(
          2,
          "comment/",
          comment,
        );
        this.$emit("newComment", commentReceived.commentId);
        this.newComment = "";
      } catch (error) {
        this.postError = true;
      }
      this.isCheckIdentity = false;
    },
    /* defineTimelineValue(): number {
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
    }, */
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app .comment-input-container {
  .comment-input {
    border-top: 0;
    border-right: 0;
    border-left: 0;
    border-bottom: 0.1rem solid #ddd !important;
    overflow: hidden !important;
    box-shadow: unset !important;
    background: transparent !important;
    min-height: 36px;
    resize: none;
  }
}
</style>
