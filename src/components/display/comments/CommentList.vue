<template>
  <div class="d-flex flex-column">
    <div
      v-if="isNotAnAnswerList && 0 !== totalCount"
      class="text-secondary mb-2"
    >
      {{ $t("Number comments", { nb: totalCount }) }}
    </div>
    <div v-if="!loading && !error && 0 === totalCount" class="text-center">
      {{ $t("No comments") }}
    </div>
    <div
      ref="scrollComponent"
      :class="isNotAnAnswerList ? 'scrolling-comments' : ''"
    >
      <CommentItem
        v-for="(c, indexCom) in comments"
        :ref="'comItem' + c.commentId"
        :key="c.commentId"
        v-model:comment="comments[indexCom]"
        :podcast="podcast"
        :is-flat-list="isFlatList"
        :config="config"
        :organisation-id="organisationId"
        @delete-comment="deleteComment(c.commentId)"
      />
      <ClassicLoading
        :loading-text="loading ? $t('Loading content ...') : undefined"
        :error-text="error ? $t(`Comments loading error`) : undefined"
      />
      <button
        v-if="!isNotAnAnswerList && dfirst + dsize < totalCount"
        class="btn share-btn mx-2 saooti-more"
        :title="$t('See more')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import ClassicLoading from "../../form/ClassicLoading.vue";
import { handle403 } from "../../mixins/handle403";
import octopusApi from "@saooti/octopus-api";
import { defineAsyncComponent, defineComponent } from "vue";
import { AxiosError } from "axios";
import { CommentPodcast } from "@/stores/class/general/comment";
import { Podcast } from "@/stores/class/general/podcast";
import {
  CommentMessage,
  CommentsConfig,
} from "@/stores/class/config/commentsConfig";
/* eslint-disable */
const CommentItem: any = defineAsyncComponent(() => import('./item/CommentItem.vue'));
/* eslint-enable */
export default defineComponent({
  name: "CommentsList",

  components: {
    ClassicLoading,
    CommentItem,
  },
  mixins: [handle403],

  props: {
    size: { default: 10, type: Number },
    podcast: { default: undefined, type: Object as () => Podcast },
    reload: { default: false, type: Boolean },
    answerToComment: { default: undefined, type: Number },
    isFlatList: { default: false, type: Boolean },
    stateFilter: { default: "", type: String },
    organisationId: { default: undefined, type: String },
    nbComments: { default: 0, type: Number },
    config: { default: undefined, type: Object as () => CommentsConfig },
    eventToHandle: { default: undefined, type: Object as () => CommentMessage },
  },
  emits: ["update:nbComments", "commentDeleted"],

  data() {
    return {
      loading: true as boolean,
      error: false as boolean,
      dfirst: 0 as number,
      dsize: this.size,
      totalCount: 0 as number,
      comments: [] as Array<CommentPodcast>,
      scrollableSection: undefined as HTMLElement | undefined,
    };
  },

  computed: {
    changed(): string {
      return `${this.size}|${this.reload}|${this.dsize}|${this.stateFilter}|${this.podcast?.podcastId}|${this.organisationId}`;
    },
    isNotAnAnswerList(): boolean {
      return undefined === this.answerToComment;
    },
  },
  watch: {
    totalCount() {
      this.$emit("update:nbComments", this.totalCount);
    },
    changed(): void {
      this.fetchContent(true);
    },
    eventToHandle: {
      deep: true,
      handler() {
        if (!this.eventToHandle) {
          return;
        }
        if (this.answerToComment === this.eventToHandle.comment.answerTo) {
          switch (this.eventToHandle.type) {
            case "CREATE":
              this.createComment(this.eventToHandle.comment);
              break;
            case "UPDATE":
              this.updateComment(this.eventToHandle.comment);
              break;
            case "DELETE":
              this.deleteComment(this.eventToHandle.comment.commentId);
              break;
            default:
              break;
          }
          return;
        }
        if (undefined !== this.eventToHandle.comment.answerTo) {
          (
            this.$refs["comItem" + this.eventToHandle.comment.answerTo] as
              | Array<InstanceType<typeof CommentItem>>
              | undefined
          )?.[0]?.receiveEvent(this.eventToHandle);
        }
      },
    },
  },

  mounted() {
    this.fetchContent(true);
    if (this.isNotAnAnswerList) {
      this.scrollableSection = this.$refs.scrollComponent as HTMLElement;
      this.scrollableSection.addEventListener("scroll", this.handleScroll);
    }
  },
  unmounted() {
    if (this.isNotAnAnswerList) {
      this.scrollableSection?.removeEventListener("scroll", this.handleScroll);
    }
  },
  methods: {
    handleScroll() {
      if (
        this.scrollableSection &&
        this.totalCount > this.comments.length &&
        this.scrollableSection.scrollTop +
          this.scrollableSection.clientHeight >=
          this.scrollableSection.scrollHeight
      ) {
        this.fetchContent(false);
      }
    },
    findCommentInCommentsLoaded(commentId: number) {
      return this.comments.findIndex(
        (element: CommentPodcast) => element.commentId === commentId,
      );
    },
    createComment(comment: CommentPodcast) {
      this.comments.unshift(comment);
      this.totalCount += 1;
    },
    updateComment(comment: CommentPodcast) {
      const commentIndex = this.findCommentInCommentsLoaded(comment.commentId);
      if (-1 !== commentIndex) {
        this.comments.splice(commentIndex, 1, comment);
      }
    },
    deleteComment(commentIdToDelete: number) {
      const commentIndex = this.findCommentInCommentsLoaded(commentIdToDelete);
      if (-1 !== commentIndex) {
        this.comments.splice(commentIndex, 1);
        this.totalCount -= 1;
        this.$emit("commentDeleted", commentIdToDelete);
      }
    },
    async fetchContent(reset: boolean): Promise<void> {
      this.loading = true;
      if (reset) {
        this.dfirst = 0;
        this.comments.length = 0;
      }
      const param = {
        first: this.dfirst,
        size: this.dsize,
        podcastId: this.podcast?.podcastId,
        sort: "DATE_DESC",
        answerTo: this.answerToComment,
        hideAnswers: !this.isFlatList,
        state: this.stateFilter.length ? this.stateFilter : undefined,
        organisationId: this.organisationId,
      };
      try {
        const data = await octopusApi.fetchDataPublicWithParams<{
          count: number;
          result: Array<CommentPodcast>;
          sort: string;
        }>(2, "comment/list", param);
        if (reset) {
          this.comments.length = 0;
        }
        this.comments.push(...data.result);
        this.totalCount = data.count;
        this.dfirst += this.dsize;
        this.loading = false;
      } catch (error) {
        this.handle403(error as AxiosError);
        this.error = true;
      }
    },
  },
});
</script>
<style lang="scss">
.octopus-app {
  .scrolling-comments {
    max-height: 715px;
    overflow-y: auto;
  }
}
</style>
