<template>
  <div class="d-flex align-items-center mt-1">
    <CheckIdentityModal
      v-if="isCheckIdentityActions"
      :title="t('Welcome, thanks for your interaction')"
      @validate="likeActions(isCheckIdentityActions)"
      @close="isCheckIdentityActions = undefined"
    />
    <template v-for="section in feelingSection" :key="section.name">
      <template v-if="section.condition">
        <LikeButton
          :like="'like' === section.name"
          :is-active="section.name === userFeeling"
          :can-interact="canLikeOrDislike"
          @like-action="initiateLikeActions"
        />
        <span v-if="section.counter" class="ms-1 me-2">{{
          transformInThousands(section.counter)
        }}</span>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, Ref, ref, computed, onBeforeMount } from "vue";
import classicApi from "../../../../api/classicApi";
import { useCommentStore } from "../../../../stores/CommentStore";
import { useAuthStore } from "../../../../stores/AuthStore";
import {
  CommentFeelings,
  CommentPodcast,
} from "@/stores/class/general/comment";
import { CommentsConfig } from "@/stores/class/config/commentsConfig";
import { Podcast } from "@/stores/class/general/podcast";
import { useI18n } from "vue-i18n";
const CheckIdentityModal = defineAsyncComponent(
  () => import("../modal/CheckIdentityModal.vue"),
);
const LikeButton = defineAsyncComponent(() => import("./LikeButton.vue"));

//Props 
const props = defineProps({
  comment: { default: () => undefined, type: Object as () => CommentPodcast },
  editRight: { default: false, type: Boolean },
  podcast: { default: undefined, type: Object as () => Podcast },
})

//Emits
const emit = defineEmits(["deleteComment", "update:comment"]);

//Data 
const isCheckIdentityActions: Ref<string | undefined> = ref(undefined);
const userFeeling: Ref<string | undefined> = ref(undefined);
const config: Ref<CommentsConfig | undefined> = ref(undefined);
const podcastFeeling: Ref<CommentFeelings | undefined> = ref(undefined);


//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const commentStore = useCommentStore();

//Computed
const configToApply = computed(() => {
  if (props.comment) {
    return config.value?.commentLikes;
  }
  return config.value?.podcastLikes;
});
const podcastId = computed(() =>  props.podcast?.podcastId ?? 0);
const feelingSection = computed(() => {
  return [
    {
      name: "like",
      counter: props.comment?.likes ?? podcastFeeling.value?.likesCount,
      condition: configToApply.value?.likeEnabled ?? false,
    },
    {
      name: "dislike",
      counter: props.editRight
        ? (props.comment?.dislikes ?? podcastFeeling.value?.dislikesCount)
        : 0,
      condition: configToApply.value?.dislikeEnabled ?? false,
    },
  ];
});
const canLikeOrDislike = computed(() => {
  return (
    !configToApply.value?.authRequired ||
    (configToApply.value.authRequired && undefined !== authStore.authOrgaId)
  );
});

onBeforeMount(()=>initLikeConfig())


//Methods
async function initLikeConfig() {
  if (!props.podcast) {
    return;
  }
  config.value = await commentStore.getCommentsConfig(props.podcast);
  if (
    props.comment ||
    (!config.value.podcastLikes.likeEnabled &&
      !config.value.podcastLikes.dislikeEnabled)
  ) {
    return;
  }
  await fetchPodcastCounters();
}
async function fetchPodcastCounters() {
  const data = await classicApi.fetchData<{
    [key: number]: CommentFeelings;
  }>({
    api: 2,
    path: "podcast/status",
    parameters: {
      podcastId: [podcastId.value],
      uuid: commentStore.commentUser?.uuid,
    },
    isNotAuth: true,
  });
  podcastFeeling.value = data[podcastId.value];
  if ("LIKED" === podcastFeeling.value.feeling) {
    userFeeling.value = "like";
  } else if ("DISLIKED" === podcastFeeling.value.feeling) {
    userFeeling.value = "dislike";
  }
}
function transformInThousands(nb: number) {
  if (nb >= 1000) {
    return Math.round(nb / 100) / 10 + "k";
  }
  return nb.toString();
}
async function initiateLikeActions(actionName: string) {
  if (!commentStore.commentUser?.name) {
    isCheckIdentityActions.value = actionName;
    return;
  }
  likeActions(actionName);
}
async function likeActions(actionName: string) {
  const prefix = props.comment ? "comment/" : "podcast/";
  const data = await classicApi.putData<{
    [key: number]: CommentFeelings;
  }>({
    api: 2,
    path: prefix + actionName,
    dataToSend: {
      ids: [props.comment?.commentId ?? podcastId.value],
      name: commentStore.commentUser?.name,
      uuid: commentStore.commentUser?.uuid,
    },
    isNotAuth: true,
  });
  if (props.comment) {
    emit("update:comment", {
      ...props.comment,
      ...{
        likes: data[props.comment.commentId].likesCount,
        dislikes: data[props.comment.commentId].dislikesCount,
      },
    });
  } else {
    podcastFeeling.value = data[podcastId.value];
  }
  userFeeling.value = userFeeling.value ? undefined : actionName;
  isCheckIdentityActions.value = undefined;
}
</script>
