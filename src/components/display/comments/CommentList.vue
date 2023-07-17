<template>
  <div class="d-flex flex-column mt-3">
    <ClassicLoading
      :loading-text="loading ? $t('Loading content ...') : undefined"
      :error-text="error ? $t(`Comments loading error`) : undefined"
    />
    <div v-show="!loading">
      <CommentItem
        v-for="(c, indexCom) in comments"
        :ref="'comItem' + c.comId"
        :key="c.comId"
        v-model:comment="comments[indexCom]"
        :is-flat="isFlat"
        :podcast="podcast"
        :fetch-conference="fetchConference"
        :organisation="organisation"
        @delete-comment="deleteComment(c)"
        @update-comment="updateComment"
      />
    </div>
    <button
      v-show="!allFetched && (!loading || 0 !== first)"
      class="btn btn-primary mt-2"
      :class="comId ? 'align-self-start' : 'align-self-center'"
      :disabled="loading"
      :title="$t('See more comments')"
      @click="fetchContent(false)"
    >
      {{ $t("See more comments") }}
    </button>
  </div>
</template>

<script lang="ts">
import ClassicLoading from "../../form/ClassicLoading.vue";
import { state } from "../../../stores/ParamSdkStore";
import octopusApi from "@saooti/octopus-api";
import dayjs from "dayjs";
import { Podcast } from "@/stores/class/general/podcast";
import { Conference } from "@/stores/class/conference/conference";
import { CommentPodcast } from "@/stores/class/general/comment";
import { InterfacePageable } from "@/stores/class/general/interfacePageable";
import { defineComponent, defineAsyncComponent } from "vue";
/* eslint-disable */
const CommentItem: any = defineAsyncComponent(() => import('./CommentItem.vue'));
/* eslint-enable */
export default defineComponent({
  name: "CommentList",

  components: {
    CommentItem,
    ClassicLoading,
  },

  props: {
    podcast: { default: undefined, type: Object as () => Podcast },
    comId: { default: undefined, type: Number },
    reload: { default: false, type: Boolean },
    fetchConference: { default: undefined, type: Object as () => Conference },
    organisation: { default: undefined, type: String },
    status: { default: undefined, type: String },
    isFlat: { default: false, type: Boolean },
  },
  emits: ["updateStatus", "fetch"],

  data() {
    return {
      loading: true as boolean,
      error: false as boolean,
      first: 0 as number,
      size: 20 as number,
      totalCount: 0 as number,
      comments: [] as Array<CommentPodcast>,
    };
  },

  computed: {
    allFetched(): boolean {
      return this.first >= this.totalCount;
    },
    myOrganisationId(): string | undefined {
      return state.generalParameters.organisationId;
    },
    podcastId(): number | undefined {
      return this.podcast?.podcastId;
    },
    editRight(): boolean {
      return (
        (true === state.generalParameters.isCommments &&
          (this.myOrganisationId === this.podcast?.organisation.id ||
            this.myOrganisationId === this.organisation)) ||
        true === state.generalParameters.isAdmin
      );
    },
    watchVariable(): string {
      return `${this.reload}|${this.status}`;
    },
    statusPost(): Array<string> {
      if (this.editRight && this.status) {
        return [this.status];
      }
      return this.editRight ? ["Valid", "Pending", "Invalid"] : ["Valid"];
    },
  },
  watch: {
    watchVariable: {
      immediate: true,
      handler() {
        this.fetchContent();
      },
    },
    comments: {
      deep: true,
      handler() {
        this.$emit("fetch", {
          count: this.totalCount,
          comments: this.comments,
        });
      },
    },
  },
  methods: {
    async fetchContent(reset = true): Promise<void> {
      this.loading = true;
      this.error = false;
      if (reset) {
        this.first = 0;
      }
      let data;
      try {
        if (this.comId) {
          data = await octopusApi.postDataPublic<
            InterfacePageable<CommentPodcast>
          >(2, this.comId.toString(), { first: this.first, size: this.size });
        } else {
          data = await octopusApi.postDataPublic<
            InterfacePageable<CommentPodcast>
          >(2, this.isFlat ? "" : "getRootCom", {
            first: this.first,
            size: this.size,
            podcastId: this.podcastId,
            status: this.statusPost,
            organisationId:
              undefined === this.podcastId ? this.organisation : undefined,
          });
        }
        if (reset) {
          this.comments.length = 0;
        }
        this.totalCount = data.totalElements;
        this.comments = this.comments
          .concat(data.content)
          .filter((c: CommentPodcast) => {
            return null !== c;
          });
        this.first += this.size;
      } catch {
        this.error = true;
      }
      this.loading = false;
    },
    findCommentIndex(comId: number | undefined): number {
      return this.comments.findIndex(
        (element: CommentPodcast) => element.comId === comId,
      );
    },
    commentInAnotherList(commentIdReferer: undefined | number): boolean {
      return (
        !this.isFlat &&
        undefined !== commentIdReferer &&
        null !== commentIdReferer &&
        this.comId !== commentIdReferer
      );
    },
    deleteComment(comment: CommentPodcast): void {
      if (this.commentInAnotherList(comment.commentIdReferer)) {
        const comItem = (
          this.$refs["comItem" + comment.commentIdReferer] as Array<
            InstanceType<typeof CommentItem>
          >
        )[0];
        comItem.receiveCommentEvent({ type: "Delete", comment: comment });
        return;
      }
      const index = this.findCommentIndex(comment.comId);
      if (-1 === index) return;
      this.totalCount -= 1;
      if (0 !== this.first) {
        this.first -= 1;
      }
      this.comments.splice(index, 1);
    },
    updateExistingComment(comment: CommentPodcast, index: number) {
      if (
        (!this.editRight && "Valid" !== comment.status) ||
        (this.editRight && this.status && this.status !== comment.status)
      ) {
        this.comments.splice(index, 1);
      } else {
        this.comments.splice(index, 1, comment);
      }
    },
    updateNotExistingComment(comment: CommentPodcast) {
      let indexNewComment = 0;
      for (let i = 0, len = this.comments.length; i < len; i++) {
        if (dayjs(this.comments[i].date).isBefore(dayjs(comment.date))) {
          indexNewComment = i;
          break;
        }
      }
      this.comments.splice(indexNewComment, 0, comment);
    },
    updateComment(data: {
      type: string;
      comment: CommentPodcast;
      oldStatus?: string;
    }): void {
      if (this.commentInAnotherList(data.comment.commentIdReferer)) {
        const comItem = (
          this.$refs["comItem" + data.comment.commentIdReferer] as Array<
            InstanceType<typeof CommentItem>
          >
        )[0];
        comItem.receiveCommentEvent(data);
        return;
      }
      const index = this.findCommentIndex(data.comment.comId);
      if (-1 !== index) {
        this.updateExistingComment(data.comment, index);
      } else if (
        (!this.editRight && "Valid" === data.comment.status) ||
        (this.editRight && !this.status) ||
        (this.editRight && this.status && this.status === data.comment.status)
      ) {
        this.updateNotExistingComment(data.comment);
      }
      if (this.comId && data.oldStatus !== data.comment.status) {
        this.$emit("updateStatus", data.comment.status);
      }
    },
    addNewComment(comment: CommentPodcast, myself = false): void {
      if (!myself && !this.editRight && "Valid" !== comment.status) {
        return;
      }
      if (this.commentInAnotherList(comment.commentIdReferer)) {
        const comItem = (
          this.$refs["comItem" + comment.commentIdReferer] as Array<
            InstanceType<typeof CommentItem>
          >
        )[0];
        comItem.receiveCommentEvent({ type: "Create", comment: comment });
        return;
      }
      const index = this.findCommentIndex(comment.comId);
      if (-1 === index) {
        this.totalCount += 1;
        this.first += 1;
        if (!this.status || this.status === comment.status) {
          this.comments.unshift(comment);
        }
      }
    },
  },
});
</script>
