<template>
  <div
    class="d-flex flex-column flex-grow-1 w-100 really-light-secondary-bg"
    :class="isAnAnswer && !isFlatList ? 'my-1 p-0' : 'my-3 p-2'"
  >
    <div class="d-flex flex-nowrap justify-content-between align-items-center">
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
          {{ t("To answer") }}
        </button>
        <button
          v-if="isFlatList && comment.answerTo"
          class="btn btn-transparent d-flex align-items-center"
          @click="showParentComment = !showParentComment"
        >
          {{ t("In response to") }}
          <ChevronDownIcon :class="{ 'arrow-transform': showParentComment }" />
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
          <ChevronDownIcon :class="{ 'arrow-transform': showAnswers }" />
          {{ t("nb answers", { nb: comment.responses.length }) }}
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

<script setup lang="ts">
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";
import { CommentPodcast } from "@/stores/class/general/comment";
import { Podcast } from "../../../../stores/class/general/podcast";
import CommentBasicView from "./CommentBasicView.vue";
import { useCommentStore } from "../../../../stores/CommentStore";
import { useAuthStore } from "../../../../stores/AuthStore";
import { defineAsyncComponent, ref, Ref, computed } from "vue";
import {
  CommentMessage,
  CommentsConfig,
} from "../../../../stores/class/config/commentsConfig";
import { useI18n } from "vue-i18n";
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


//Props 
const props = defineProps({
  comment: { default: () => ({}), type: Object as () => CommentPodcast },
  podcast: { default: undefined, type: Object as () => Podcast },
  isFlatList: { default: false, type: Boolean },
  config: { default: undefined, type: Object as () => CommentsConfig },
  organisationId: { default: undefined, type: String },
})

//Emits
const emit = defineEmits(["deleteComment", "update:comment"]);

//Data 
const isAnsweringComment = ref(false);
const showAnswers = ref(false);
const focus = ref(false);
const showParentComment = ref(false);
const eventToHandle : Ref<CommentMessage | undefined>= ref(undefined);

//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const commentStore = useCommentStore();


//Computed
const commentForVmodel = computed({
  get(): CommentPodcast {
    return props.comment;
  },
  set(value: CommentPodcast) {
    if (!eventActive.value) {
      emit("update:comment", value);
    }
  },
});
const isAnAnswer = computed(() => undefined !== props.comment.answerTo);
const editRight = computed(() => {
  return (
    (true === authStore.isRoleComments &&
      (authStore.authOrgaId === props.podcast?.organisation.id ||
      authStore.authOrgaId === props.organisationId)) ||
    true === authStore.isRoleAdmin
  );
});
const isValidComment = computed(() => "VALIDATED" === props.comment.state);
const canPostComment = computed(() => {
  return commentStore.getCanPostComment(
    props.config,
    props.podcast,
    undefined !== authStore.authOrgaId,
  );
});
const eventActive = computed(() => undefined !== props.podcast?.conferenceId);

 
//Methods
function answerComment(): void {
  isAnsweringComment.value = true;
  focus.value = !focus.value;
}
function newComment(comment: CommentPodcast): void {
  modifyAnswerNumber(comment.commentId);
  if (!eventActive.value) {
    eventToHandle.value = { type: "CREATE", comment: comment };
  }
  isAnsweringComment.value = false;
}
function modifyAnswerNumber(commentId: number, isAdd = true) {
  const commentToEdit = props.comment;
  if (commentToEdit.responses) {
    if (isAdd) {
      commentToEdit.responses.push(commentId);
    } else {
      const index = commentToEdit.responses.indexOf(commentId);
      if (index !== -1) {
        commentToEdit.responses.splice(index, 1);
      }
    }
  } else if (isAdd) {
    commentToEdit.responses = [commentId];
  }
  emit("update:comment", commentToEdit);
}
function emitDeleteComment() {
  if (!eventActive.value) {
    emit("deleteComment");
  }
}
function receiveEvent(event: CommentMessage) {
  if ("CREATE" === event.type) {
    modifyAnswerNumber(event.comment.commentId);
  } else if ("DELETE" === event.type) {
    modifyAnswerNumber(event.comment.commentId, false);
  }
  eventToHandle.value = event;
}
function updateForAnswerDeleted(commentId: number) {
  modifyAnswerNumber(commentId, false);
}
</script>
