<template>
  <div
    class="d-flex flex-column flex-grow-1 w-100 really-light-secondary-bg"
    :class="isAnAnswer && !isFlatList ? 'my-1 p-0' : 'my-3 p-2'"
  >
    <div class="d-flex justify-content-between align-items-center">
      <CommentBasicView :comment="comment" :edit-right="editRight" />
      <CommentMoreActions
        v-model:comment="commentForVmodel"
        :edit-right="editRight"
        :podcast="podcast"
        :config="config"
        @delete-comment="emitDeleteComment"
      />
    </div>
    <template v-if="isValidComment">
      <div class="d-flex align-items-center mt-1">
        <LikeSection
          v-model:comment="commentForVmodel"
          :edit-right="editRight"
          :podcast="podcast"
        />
        <button
          v-if="!comment.answerTo && canPostComment"
          class="btn btn-transparent"
          @click="answerComment"
        >
          {{ $t("To answer") }}
        </button>
        <button
          v-if="isFlatList && comment.answerTo"
          class="btn btn-transparent d-flex align-items-center"
          @click="showParentComment = !showParentComment"
        >
          {{ $t("In response to") }}
          <div
            class="saooti-down ms-1"
            :class="{ 'arrow-transform': showParentComment }"
          />
        </button>
      </div>
      <CommentInput
        v-if="isAnsweringComment && canPostComment"
        class="ms-4"
        :focus="focus"
        :podcast="podcast"
        :in-answer-comment="comment"
        @cancel-action="isAnsweringComment = false"
        @new-comment="newComment"
      />
      <div
        v-if="comment.responses?.length && !isFlatList"
        class="ms-4 mt-2 answers-section"
      >
        <button
          class="d-flex align-items-center btn-transparent text-primary"
          @click="showAnswers = !showAnswers"
        >
          <div
            class="saooti-down me-3"
            :class="{ 'arrow-transform': showAnswers }"
          />
          {{ $t("nb answers", { nb: comment.responses.length }) }}
        </button>
        <CommentList
          v-if="showAnswers"
          ref="commentList"
          :podcast="podcast"
          :size="5"
          :answer-to-comment="comment.commentId"
          :config="config"
          :event-to-handle="eventToHandle"
          @comment-deleted="updateForAnswerDeleted"
        />
      </div>
    </template>
    <CommentParentInfo
      v-if="showParentComment"
      class="ms-4"
      :comment-id="comment.answerTo"
      :edit-right="editRight"
    />
  </div>
</template>

<script lang="ts">
import selenium from "../../../mixins/selenium";
import displayMethods from "../../../mixins/displayMethods";
import { CommentPodcast } from "@/stores/class/general/comment";
import { Podcast } from "../../../../stores/class/general/podcast";
import CommentBasicView from "./CommentBasicView.vue";
import { useCommentStore } from "@/stores/CommentStore";
import { mapActions, mapState } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
import {
  CommentMessage,
  CommentsConfig,
} from "../../../../stores/class/config/commentsConfig";
import { state } from "../../../../stores/ParamSdkStore";
const CommentInput = defineAsyncComponent(() => import("../CommentInput.vue"));
const CommentParentInfo = defineAsyncComponent(
  () => import("../CommentParentInfo.vue"),
);
const LikeSection = defineAsyncComponent(
  () => import("../like/LikeSection.vue"),
);
const CommentMoreActions = defineAsyncComponent(
  () => import("./CommentMoreActions.vue"),
);
const CommentList = defineAsyncComponent(() => import("../CommentList.vue"));
export default defineComponent({
  name: "CommentItem",

  components: {
    CommentInput,
    CommentList,
    CommentParentInfo,
    CommentBasicView,
    LikeSection,
    CommentMoreActions,
  },

  mixins: [displayMethods, selenium],

  props: {
    comment: { default: () => ({}), type: Object as () => CommentPodcast },
    podcast: { default: undefined, type: Object as () => Podcast },
    isFlatList: { default: false, type: Boolean },
    config: { default: undefined, type: Object as () => CommentsConfig },
    organisationId: { default: undefined, type: String },
  },

  emits: ["deleteComment", "update:comment"],

  data() {
    return {
      isAnsweringComment: false as boolean,
      showAnswers: false as boolean,
      focus: false as boolean,
      showParentComment: false as boolean,
      eventToHandle: undefined as CommentMessage | undefined,
    };
  },
  computed: {
    ...mapState(useCommentStore, ["commentUser"]),
    commentForVmodel: {
      get(): CommentPodcast {
        return this.comment;
      },
      set(value: CommentPodcast) {
        if (!this.eventActive) {
          this.$emit("update:comment", value);
        }
      },
    },
    isAnAnswer() {
      return undefined !== this.comment.answerTo;
    },
    myOrganisationId(): string | undefined {
      return state.generalParameters.organisationId;
    },
    editRight(): boolean {
      return (
        (true === state.generalParameters.isCommments &&
          (this.myOrganisationId === this.podcast?.organisation.id ||
            this.myOrganisationId === this.organisationId)) ||
        true === state.generalParameters.isAdmin
      );
    },
    isValidComment() {
      return "VALIDATED" === this.comment.state;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated as boolean;
    },
    canPostComment(): boolean {
      return this.getCanPostComment(
        this.config,
        this.podcast,
        this.authenticated,
      );
    },
    eventActive(): boolean {
      return undefined !== this.podcast?.conferenceId;
    },
  },
  methods: {
    ...mapActions(useCommentStore, ["getCanPostComment"]),
    answerComment(): void {
      this.isAnsweringComment = true;
      this.focus = !this.focus;
    },
    newComment(comment: CommentPodcast): void {
      this.modifyAnswerNumber(comment.commentId);
      if (!this.eventActive) {
        this.eventToHandle = { type: "CREATE", comment: comment };
      }
      this.isAnsweringComment = false;
    },
    modifyAnswerNumber(commentId: number, isAdd = true) {
      const commentToEdit = this.comment;
      if (commentToEdit.responses) {
        if (this.isAdd) {
          commentToEdit.responses.push(commentId);
        } else {
          var index = commentToEdit.responses.indexOf(commentId);
          if (index !== -1) {
            commentToEdit.responses.splice(index, 1);
          }
        }
      } else if (isAdd) {
        commentToEdit.responses = [commentId];
      }
      this.$emit("update:comment", commentToEdit);
    },
    emitDeleteComment() {
      if (!this.eventActive) {
        this.$emit("deleteComment");
      }
    },
    receiveEvent(event: CommentMessage) {
      if ("CREATE" === event.type) {
        this.modifyAnswerNumber(event.comment.commentId);
      } else if ("DELETE" === event.type) {
        this.modifyAnswerNumber(event.comment.commentId, false);
      }
      this.eventToHandle = event;
    },
    updateForAnswerDeleted(commentId: number) {
      this.modifyAnswerNumber(commentId, false);
    },
  },
});
</script>

