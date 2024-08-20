<template>
  <div
    class="d-flex flex-column flex-grow-1 w-100 really-light-secondary-bg"
    :class="isAnAnswer && !isFlatList ? 'my-1 p-0' : 'my-3 p-2'"
  >
    <CheckIdentityModal
      v-if="isCheckIdentityActions"
      :title="$t('Welcome, thanks for your interaction')"
      @validate="likeActions(isCheckIdentityActions)"
      @close="isCheckIdentityActions = undefined"
    />
    <div class="d-flex justify-content-between align-items-center">
      <CommentBasicView :comment="comment" :edit-right="editRight" />
      <CommentMoreActions
        v-model:comment="commentForVmodel"
        :edit-right="editRight"
        :podcast="podcast"
        @delete-comment="emitDeleteComment"
      />
    </div>
    <template v-if="isValidComment">
      <div class="d-flex align-items-center mt-1">
        <template v-for="section in feelingSection" :key="section.name">
          <template v-if="section.condition">
            <CommentLikeButton
              :like="'like' === section.name"
              :is-active="section.name === userFeeling"
              @like-action="initiateLikeActions"
            />
            <span v-if="section.counter" class="ms-1 me-2">{{
              transformInThousands(section.counter)
            }}</span>
          </template>
        </template>
        <button
          v-if="!comment.answerTo"
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
        v-if="isAnsweringComment"
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
import {
  CommentFeelings,
  CommentPodcast,
} from "@/stores/class/general/comment";
import { Podcast } from "../../../../stores/class/general/podcast";
import CommentBasicView from "./CommentBasicView.vue";
import { useCommentStore } from "@/stores/CommentStore";
import { mapState } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
import octopusApi from "@saooti/octopus-api";
import {
  CommentMessage,
  CommentsConfig,
} from "../../../../stores/class/config/commentsConfig";
import { state } from "../../../../stores/ParamSdkStore";
const CommentInput = defineAsyncComponent(() => import("../CommentInput.vue"));
const CommentParentInfo = defineAsyncComponent(
  () => import("../CommentParentInfo.vue"),
);
const CheckIdentityModal = defineAsyncComponent(
  () => import("../modal/CheckIdentityModal.vue"),
);
const CommentLikeButton = defineAsyncComponent(
  () => import("../button/CommentLikeButton.vue"),
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
    CheckIdentityModal,
    CommentLikeButton,
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
      isCheckIdentityActions: undefined as string | undefined,
      userFeeling: undefined as string | undefined,
      showParentComment: false as boolean,
      eventToHandle: undefined as CommentMessage | undefined,
    };
  },
  computed: {
    ...mapState(useCommentStore, ["commentUser"]),
    feelingSection() {
      return [
        {
          name: "like",
          counter: this.comment.likes,
          condition: this.config?.commentLikes.likeEnabled ?? false,
        },
        {
          name: "dislike",
          counter: this.editRight ? this.comment.dislikes : 0,
          condition: this.config?.commentLikes.dislikeEnabled ?? false,
        },
      ];
    },
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
    eventActive(): boolean {
      return undefined !== this.podcast?.conferenceId;
    },
  },
  methods: {
    transformInThousands(nb: number) {
      if (nb >= 1000) {
        return Math.round(nb / 100) / 10 + "k";
      }
      return nb.toString();
    },
    async initiateLikeActions(actionName: string) {
      if (!this.commentUser?.name) {
        this.isCheckIdentityActions = actionName;
        return;
      }
      this.likeActions(actionName);
    },
    async likeActions(actionName: string) {
      const data = await octopusApi.putDataPublic<{
        [key: number]: CommentFeelings;
      }>(2, "comment/" + actionName, {
        ids: [this.comment.commentId],
        name: this.commentUser?.name,
        uuid: this.commentUser?.uuid,
      });
      this.$emit("update:comment", {
        ...this.comment,
        ...{
          likes: data[this.comment.commentId].likesCount,
          dislikes: data[this.comment.commentId].dislikesCount,
        },
      });
      this.userFeeling = this.userFeeling ? undefined : actionName;
      this.isCheckIdentityActions = undefined;
    },
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
<style lang="scss">
.octopus-app {
  .answers-section {
    .btn.btn-primary {
      align-self: start !important;
      margin: 0.5rem 0 0 0 !important;
    }
  }
}
</style>
