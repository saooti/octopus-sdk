<template>
  <ListPaginate
    id="commentListPaginate"
    v-model:first="dfirst"
    v-model:rowsPerPage="dsize"
    v-model:isMobile="isMobile"
    :text-count="totalCount ? $t('Number comments', { nb: totalCount }) : ''"
    :total-count="totalCount"
    :loading="loading"
    :just-size-chosen="undefined !== answerToComment"
    :error-text="error ? $t(`Comments loading error`) : undefined"
    :loading-text="loading ? $t('Loading content ...') : undefined"
  >
    <template #list>
      <div v-if="!loading && !error && 0 === totalCount" class="text-center">
        {{ $t("No comments") }}
      </div>
      <CommentItem
        v-for="(c, indexCom) in displayArray"
        :ref="'comItem' + c.commentId"
        :key="c.commentId"
        v-model:comment="comments[indexCom]"
        :podcast="podcast"
        :is-flat-list="isFlatList"
        @delete-comment="deleteComment(c)"
      />
    </template>
  </ListPaginate>
</template>

<script lang="ts">
import ListPaginate from "../list/ListPaginate.vue";
import { handle403 } from "../../mixins/handle403";
import octopusApi from "@saooti/octopus-api";
import { defineAsyncComponent, defineComponent } from "vue";
import { AxiosError } from "axios";
import { CommentPodcast, emptyComment } from "@/stores/class/general/comment";
import { Podcast } from "@/stores/class/general/podcast";
/* eslint-disable */
const CommentItem: any = defineAsyncComponent(() => import('./item/CommentItem.vue'));
/* eslint-enable */
export default defineComponent({
  name: "CommentsList",

  components: {
    ListPaginate,
    CommentItem,
  },
  mixins: [handle403],

  props: {
    first: { default: 0, type: Number },
    size: { default: 20, type: Number },
    podcast: { default: undefined, type: Object as () => Podcast },
    reload: { default: false, type: Boolean },
    answerToComment: { default: undefined, type: Number },
    isFlatList: { default: false, type: Boolean },
    stateFilter: { default: "", type: String },
    organisationId: { default: undefined, type: String },
  },

  data() {
    return {
      loading: true as boolean,
      error: false as boolean,
      dfirst: this.first,
      dsize: this.size,
      totalCount: 0 as number,
      comments: [] as Array<CommentPodcast>,
      isMobile: false as boolean,
    };
  },

  computed: {
    displayArray(): Array<CommentPodcast> {
      if (this.isMobile || this.answerToComment) {
        return this.comments;
      }
      return this.comments.slice(
        this.dfirst,
        Math.min(this.dfirst + this.dsize, this.totalCount),
      );
    },
    changed(): string {
      return `${this.first}|${this.size}|${this.reload}|${this.dsize}|${this.stateFilter}|${this.podcast?.podcastId}|${this.organisationId}`;
    },
  },
  watch: {
    changed(): void {
      this.reloadList();
    },
    dfirst(): void {
      if (
        !this.comments[this.dfirst] ||
        0 === this.comments[this.dfirst].commentId
      ) {
        this.fetchContent(false);
      }
    },
  },

  mounted() {
    this.fetchContent(true);
  },
  methods: {
    reloadList() {
      this.dfirst = 0;
      this.fetchContent(true);
    },
    deleteComment(commentIdToDelete: number) {
      const commentIndex = this.comments.findIndex(
        (element: CommentPodcast) => element.commentId === commentIdToDelete,
      );
      if (-1 !== commentIndex) {
        this.comments.splice(commentIndex, 1);
      }
    },
    async fetchContent(reset: boolean): Promise<void> {
      this.loading = true;
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
        this.afterFetching(reset, data);
      } catch (error) {
        this.handle403(error as AxiosError);
        this.error = true;
      }
    },
    afterFetching(
      reset: boolean,
      data: { count: number; result: Array<CommentPodcast>; sort: string },
    ): void {
      if (reset) {
        this.comments.length = 0;
      }
      if (this.dfirst > this.comments.length) {
        for (
          let i = this.comments.length - 1, len = this.dfirst + this.dsize;
          i < len;
          i++
        ) {
          this.comments.push(emptyComment());
        }
      }
      this.comments = this.comments
        .slice(0, this.dfirst)
        .concat(data.result)
        .concat(
          this.comments.slice(this.dfirst + this.dsize, this.comments.length),
        );
      this.totalCount = data.count;
      this.loading = false;
    },
  },
});
</script>
