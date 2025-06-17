<template>
  <div class="d-flex flex-column comment-input-container mt-3">
    <CommentName v-if="commentStore.commentUser?.name" />
    <ClassicContentEditable
      ref="textarea"
      v-model="newComment"
      class="comment-input"
      :placeholder="placeholder"
      @focus="isTextareaActive = true"
    />
    <div v-if="isTextareaActive" class="d-flex justify-content-between mt-1">
      <ClassicEmojiPicker
        :id="uniqueId"
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
          {{ t("Cancel") }}
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
      :validatetext="t('Close')"
      :title="t('Error')"
      :message="t('Error occurs while post your comment...')"
      @close="postError = false"
      @validate="postError = false"
    />
  </div>
</template>

<script setup lang="ts">
import classicApi from "../../../api/classicApi";
import { Podcast } from "@/stores/class/general/podcast";
import { CommentPodcast } from "@/stores/class/general/comment";
import Constants from "../../../../public/config";
import { defineAsyncComponent, ref, computed, watch, useTemplateRef } from "vue";
import { useCommentStore } from "../../../stores/CommentStore";
import { usePlayerStore } from "../../../stores/PlayerStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { useI18n } from "vue-i18n";
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

//Props 
const props = defineProps({
  podcast: { default: undefined, type: Object as () => Podcast },
  focus: { default: false, type: Boolean },
  inAnswerComment: {
    default: undefined,
    type: Object as () => CommentPodcast,
  },
})

//Emits
const emit = defineEmits(["cancelAction", "newComment"]);

//Data 
const maxComment = Constants.MAX_COMMENT;
const newComment = ref("");
const isTextareaActive = ref(false);
const isCheckIdentity = ref(false);
const postError = ref(false);
const textareaRef = useTemplateRef('textarea');

//Composables
const { t } = useI18n();
const playerStore = usePlayerStore();
const commentStore = useCommentStore();
const authStore = useAuthStore();

//Computed
const commentTooLong = computed(() => countComment.value <= maxComment);
const countComment = computed(() => newComment.value.length);
const placeholder = computed(() => props.inAnswerComment?.commentId? t("Answer a comment"): t("Write a comment"));
const uniqueId = computed(() => "-comment"+(props.inAnswerComment?.commentId??"-parent"));


//Watch
watch(()=>props.focus, () => textareaRef?.value?.focus());


//Methods
function addEmojiSelected(emoji: string) {
  newComment.value += emoji;
}
function requestToSend(): void {
  if (commentStore.commentUser?.name) {
    postComment();
  } else {
    isCheckIdentity.value = true;
  }
}
function cancelAction(): void {
  newComment.value = "";
  isTextareaActive.value = false;
  emit("cancelAction");
}
async function postComment(): Promise<void> {
  try {
    const commentReceived = await classicApi.postData<CommentPodcast>({
      api: 2,
      path: "comment/",
      dataToSend: {
        answerTo: props.inAnswerComment?.commentId,
        content: newComment.value.trim(),
        name: commentStore.commentUser?.name ?? "",
        podcastId:
          props.podcast?.podcastId ?? props.inAnswerComment?.podcastId ?? 0,
        uuid: commentStore.commentUser?.uuid ?? "",
        timeline: defineTimelineValue(),
      },
      isNotAuth: undefined === authStore.authOrgaId,
    });
    emit("newComment", commentReceived);
    newComment.value = "";
    isTextareaActive.value = false;
  } catch {
    postError.value = true;
  }
  isCheckIdentity.value = false;
}
function defineTimelineValue(): number {
  let timeline = 0;
  if (
    undefined !== props.podcast &&
    (playerStore.playerPodcast?.podcastId === props.podcast.podcastId ||
    playerStore.playerLive?.podcastId === props.podcast.podcastId)
  ) {
    timeline = Math.round(playerStore.playerElapsed * playerStore.playerTotal);
    if (props.podcast.duration && playerStore.playerPodcast) {
      timeline = Math.round(
        timeline - (playerStore.playerTotal - props.podcast.duration / 1000),
      );
    }
  }
  return timeline < 0 ? 0 : timeline;
}
</script>

<style lang="scss">
.octopus-app .comment-input-container {
  .comment-input {
    border-bottom: 0.1rem solid var(--octopus-border-default);
    overflow: hidden;
    min-height: 36px;
    resize: none;
  }
}
</style>
