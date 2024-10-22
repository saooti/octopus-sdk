<template>
  <div class="d-flex align-items-center mt-1">
    <CheckIdentityModal
      v-if="isCheckIdentityActions"
      :title="$t('Welcome, thanks for your interaction')"
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

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
import classicApi from "../../../../api/classicApi";
import { useCommentStore } from "../../../../stores/CommentStore";
import { useAuthStore } from "../../../../stores/AuthStore";
import { mapActions, mapState } from "pinia";
import {
  CommentFeelings,
  CommentPodcast,
} from "@/stores/class/general/comment";
import { CommentsConfig } from "@/stores/class/config/commentsConfig";
import { Podcast } from "@/stores/class/general/podcast";
const CheckIdentityModal = defineAsyncComponent(
  () => import("../modal/CheckIdentityModal.vue"),
);
const LikeButton = defineAsyncComponent(() => import("./LikeButton.vue"));
export default defineComponent({
  name: "LikeSection",

  components: {
    CheckIdentityModal,
    LikeButton,
  },

  props: {
    comment: { default: () => undefined, type: Object as () => CommentPodcast },
    editRight: { default: false, type: Boolean },
    podcast: { default: undefined, type: Object as () => Podcast },
  },

  emits: ["deleteComment", "update:comment"],

  data() {
    return {
      isCheckIdentityActions: undefined as string | undefined,
      userFeeling: undefined as string | undefined,
      config: undefined as CommentsConfig | undefined,
      podcastFeeling: undefined as CommentFeelings | undefined,
    };
  },
  computed: {
    ...mapState(useAuthStore, ["authOrgaId"]),
    ...mapState(useCommentStore, ["commentUser"]),
    configToApply() {
      if (this.comment) {
        return this.config?.commentLikes;
      }
      return this.config?.podcastLikes;
    },
    podcastId(): number {
      return this.podcast?.podcastId ?? 0;
    },
    feelingSection() {
      return [
        {
          name: "like",
          counter: this.comment?.likes ?? this.podcastFeeling?.likesCount,
          condition: this.configToApply?.likeEnabled ?? false,
        },
        {
          name: "dislike",
          counter: this.editRight
            ? this.comment?.dislikes ?? this.podcastFeeling?.dislikesCount
            : 0,
          condition: this.configToApply?.dislikeEnabled ?? false,
        },
      ];
    },
    canLikeOrDislike(): boolean {
      return (
        !this.configToApply?.authRequired ||
        (this.configToApply.authRequired && undefined !== this.authOrgaId)
      );
    },
  },
  created() {
    this.initLikeConfig();
  },
  methods: {
    ...mapActions(useCommentStore, ["getCommentsConfig"]),
    async initLikeConfig() {
      if (!this.podcast) {
        return;
      }
      this.config = await this.getCommentsConfig(this.podcast);
      if (
        this.comment ||
        (!this.config.podcastLikes.likeEnabled &&
          !this.config.podcastLikes.dislikeEnabled)
      ) {
        return;
      }
      await this.fetchPodcastCounters();
    },
    async fetchPodcastCounters() {
      const data = await classicApi.fetchData<{
        [key: number]: CommentFeelings;
      }>({
        api: 2,
        path: "podcast/status",
        parameters: {
          podcastId: [this.podcastId],
          uuid: this.commentUser?.uuid,
        },
        isNotAuth: true,
      });
      this.podcastFeeling = data[this.podcastId];
      if ("LIKED" === this.podcastFeeling.feeling) {
        this.userFeeling = "like";
      } else if ("DISLIKED" === this.podcastFeeling.feeling) {
        this.userFeeling = "dislike";
      }
    },
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
      const prefix = this.comment ? "comment/" : "podcast/";
      const data = await classicApi.putData<{
        [key: number]: CommentFeelings;
      }>({
        api: 2,
        path: prefix + actionName,
        dataToSend: {
          ids: [this.comment?.commentId ?? this.podcastId],
          name: this.commentUser?.name,
          uuid: this.commentUser?.uuid,
        },
        isNotAuth: true,
      });
      if (this.comment) {
        this.$emit("update:comment", {
          ...this.comment,
          ...{
            likes: data[this.comment.commentId].likesCount,
            dislikes: data[this.comment.commentId].dislikesCount,
          },
        });
      } else {
        this.podcastFeeling = data[this.podcastId];
      }
      this.userFeeling = this.userFeeling ? undefined : actionName;
      this.isCheckIdentityActions = undefined;
    },
  },
});
</script>
