<template>
  <div class="d-flex flex-column comment-input-container mt-3">
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
import crudApi from "@/api/classicCrud";
import octopusApi from "@saooti/octopus-api";
import cookies from "../../mixins/cookies";
import { state } from "../../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import { CommentCreate, CommentPodcast } from "@/stores/class/general/comment";
import Constants from "../../../../public/config";
import { mapState } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
import { useCommentStore } from "@/stores/CommentStore";
import { usePlayerStore } from "@/stores/PlayerStore";
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
    ...mapState(usePlayerStore, [
      "playerPodcast",
      "playerLive",
      "playerElapsed",
      "playerTotal",
    ]),
    ...mapState(useCommentStore, ["commentUser"]),
    commentTooLong(): boolean {
      return this.countComment <= this.maxComment;
    },
    countComment(): number {
      return this.newComment.length;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated as boolean;
    },
    placeholder(): string {
      return this.inAnswerComment?.commentId
        ? this.$t("Answer a comment")
        : this.$t("Write a comment");
    },
  },
  watch: {
    focus(): void {
      (this.$refs.textarea as HTMLElement).focus();
    },
  },
  methods: {
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
        content: this.newComment.trim(),
        name: this.commentUser?.name ?? "",
        podcastId:
          this.podcast?.podcastId ?? this.inAnswerComment?.podcastId ?? 0,
        uuid: this.commentUser?.uuid ?? "",
        timeline: this.defineTimelineValue(),
      };
      try {
        var commentReceived;
        if (this.authenticated) {
          commentReceived = await octopusApi.postDataPublic<CommentPodcast>(
            2,
            "comment/",
            comment,
          );
        } else {
          commentReceived = await crudApi.postData<CommentPodcast>(
            2,
            "comment/",
            comment,
          );
        }
        this.$emit("newComment", commentReceived);
        this.newComment = "";
      } catch (error) {
        this.postError = true;
      }
      this.isCheckIdentity = false;
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
