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
        @delete-comment="$emit('deleteComment')"
      />
    </div>
    <template v-if="isValidComment">
      <div class="d-flex align-items-center mt-1">
        <CommentLikeButton
          :like="true"
          :is-active="'like' === userFeeling"
          @like-action="initiateLikeActions"
        />
        <span v-if="comment.likes" class="ms-1 me-2">{{
          commentLikeCounter
        }}</span>
        <CommentLikeButton
          :like="false"
          :is-active="'dislike' === userFeeling"
          @like-action="initiateLikeActions"
        />
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
          :reload="reloadAnswers"
          :answer-to-comment="comment.commentId"
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
  <!-- TODO show status -->
</template>

<script lang="ts">
import selenium from "../../../mixins/selenium";
import displayMethods from "../../../mixins/displayMethods";
import {
  CommentFeelings,
  CommentPodcast,
} from "@/stores/class/general/comment";
import { Podcast } from "@/stores/class/general/podcast";
import CommentBasicView from "./CommentBasicView.vue";
import { useCommentStore } from "@/stores/CommentStore";
import { mapState } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
import octopusApi from "@saooti/octopus-api";
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
  },

  emits: ["deleteComment", "update:comment"],

  data() {
    return {
      isAnsweringComment: false as boolean,
      showAnswers: false as boolean,
      focus: false as boolean,
      isCheckIdentityActions: undefined as string | undefined,
      userFeeling: undefined as string | undefined,
      reloadAnswers: false as boolean,
      showParentComment: false as boolean,
    };
  },
  computed: {
    ...mapState(useCommentStore, ["commentUser"]),
    commentForVmodel: {
      get(): CommentPodcast {
        return this.comment;
      },
      set(value: CommentPodcast) {
        this.$emit("update:comment", value);
      },
    },
    isAnAnswer() {
      return undefined !== this.comment.answerTo;
    },
    commentLikeCounter(): string {
      if (this.comment.likes >= 1000) {
        return Math.round(this.comment.likes / 100) / 10 + "k";
      }
      return this.comment.likes.toString();
    },
    editRight(): boolean {
      //TODO check edit right
      return true;
      /*  return (
        (true === state.generalParameters.isCommments &&
          (this.myOrganisationId === this.podcast?.organisation.id ||
            this.myOrganisationId === this.organisation)) ||
        true === state.generalParameters.isAdmin
      ); 
      
      /* myOrganisationId(): string | undefined {
      return state.generalParameters.organisationId;
    }, */
    },
    isValidComment() {
      return "VALIDATED" === this.comment.state;
    },
  },
  methods: {
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
    newComment(commentId: number): void {
      const commentToEdit = this.comment;
      if (commentToEdit.responses) {
        commentToEdit.responses.push(commentId);
      } else {
        commentToEdit.responses = [commentId];
      }
      this.$emit("update:comment", commentToEdit);
      this.reloadAnswers = !this.reloadAnswers;
      this.isAnsweringComment = false;
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
