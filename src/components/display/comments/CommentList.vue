<template>
  <div class="d-flex flex-column mt-3">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading content ...') }}</h3>
    </div>
    <div class="text-danger align-self-center" v-if="error">
      {{ $t('Comments loading error') }}
    </div>
    <transition-group
      tag="div"
      name="comment-list"
      class="d-flex flex-column my-transition-list-comments"
      v-show="loaded"
    >
      <CommentItem
        :ref="'comItem' + c.comId"
        :isFlat="isFlat"
        v-model:comment="comments[indexCom]"
        :podcast="podcast"
        :fetchConference="fetchConference"
        :organisation="organisation"
        v-for="(c, indexCom) in comments"
        :key="c.comId"
        @deleteComment="deleteComment(c)"
        @updateComment="updateComment"
      />
    </transition-group>
    <button
      class="btn btn-primary mt-2"
      :class="comId ? 'align-self-start' : 'align-self-center'"
      @click="displayMore"
      :disabled="inFetching"
      v-show="!allFetched && loaded"
      :aria-label="$t('See more comments')"
    >
      {{ $t('See more comments') }}
    </button>
  </div>
</template>

<style lang="scss">
@import '../../../sass/_variables.scss';
.my-transition-list-comments {
  position: relative;
  .comment-list-enter-active,
  .comment-list-leave-active {
    transition: 1200ms cubic-bezier(0.59, 0.12, 0.34, 0.95);
    transition-property: opacity, transform;
    background-color: $primaryColorReallyTransparent;
  }

  .comment-list-enter {
    opacity: 0;
    transform: translateX(50px) scaleY(0.5);
    background-color: $primaryColorReallyTransparent;
  }

  .comment-list-enter-to {
    opacity: 1;
    transform: translateX(0) scaleY(1);
    background-color: $primaryColorReallyTransparent;
  }

  .comment-list-leave-active {
    position: absolute;
    background-color: $primaryColorReallyTransparent;
    top: 0;
    left: 0;
    right: 0;
  }

  .comment-list-leave-to {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: center top;
    background-color: $primaryColorReallyTransparent;
  }
}
</style>

<script lang="ts">
import { state } from '../../../store/paramStore';
const octopusApi = require('@saooti/octopus-api');
const moment = require('moment');

import { Podcast } from '@/store/class/podcast';
import { Conference } from '@/store/class/conference';
import { CommentPodcast } from '@/store/class/comment';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'CommentList',

  components: {
    CommentItem: () => import('./CommentItem.vue') as any,
  },

  props: {
    first: { default: 0 as number },
    size: { default: 50 as number},
    podcast: { default: undefined as Podcast|undefined },
    comId: { default: undefined as number|undefined },
    reload: { default: false as boolean},
    fetchConference: { default: undefined as Conference|undefined},
    organisation: { default: undefined as  string|undefined},
    status: { default: undefined as string | undefined},
    isFlat: { default: false as boolean},
  },
  emits: ['updateStatus', 'fetch'],

  data() {
    return {
      loading: true as boolean,
      loaded: false as boolean,
      error: false as boolean,
      dfirst: this.first as number,
      dsize: this.size as number,
      totalCount: 0 as number,
      comments: [] as Array<CommentPodcast>,
      inFetching: false as boolean,
    };
  },
  created() {
    this.fetchContent(true);
  },

  computed: {
    allFetched(): boolean {
      return this.dfirst >= this.totalCount;
    },
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
    podcastId(): number|undefined {
      if (this.podcast) return this.podcast.podcastId;
      return undefined;
    },
    editRight(): boolean {
      if (
        (state.generalParameters.isCommments &&
          ((this.podcast &&
            this.organisationId === this.podcast.organisation.id) ||
            this.organisationId === this.organisation)) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
  },
  methods: {
    async fetchContent(reset: boolean): Promise<void> {
      this.inFetching = true;
      this.resetData(reset);
      let data;
      try {
        const param: any = {
          first: this.dfirst,
          size: this.dsize,
          podcastId: this.podcastId,
        };
        if (!this.editRight) {
          param.status = ['Valid'];
        }else if(this.status){
          param.status = [this.status];
        }
        if (undefined === this.podcastId) {
          param.organisationId = this.organisation;
        }
        if (this.comId) {
          data = await octopusApi.fetchCommentAnswers(this.comId, {first: this.dfirst,size: this.dsize});
        } else if (!this.isFlat) {
          data = await octopusApi.fetchRootComments(param);
        } else {
          const param: any = {
            first: this.dfirst,
            size: this.dsize,
            podcastId: this.podcastId,
          };
          if (!this.editRight) {
            param.status = ['Valid'];
          }else if(this.status){
            param.status = [this.status];
          }
          if (undefined === this.podcastId) {
            param.organisationId = this.organisation;
          }
          if (!this.isFlat) {
            data = await octopusApi.fetchRootComments(param);
          } else {
            data = await octopusApi.fetchComments(param);
          }
        }
        this.resetData(reset);
        this.loading = false;
        this.loaded = true;
        this.totalCount = data.totalElements;
        this.comments = this.comments.concat(data.content).filter((c: CommentPodcast) => {
          return null !== c;
        });
        this.dfirst += this.dsize;
      } catch (error) {
        this.loading = false;
        this.error = true;
      }
      this.inFetching = false;
    },
    resetData(reset: boolean): void {
      if (!reset) return;
      this.comments.length = 0;
      this.dfirst = 0;
      this.loading = true;
      this.loaded = false;
    },
    displayMore(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.fetchContent(false);
    },
    deleteComment(comment: CommentPodcast): void {
      if (
        !this.isFlat &&
        comment.commentIdReferer &&
        this.comId !== comment.commentIdReferer
      ) {
        const comItem: any = document.getElementsByClassName('comItem' + comment.commentIdReferer);
        comItem[0].receiveCommentEvent({ type: 'Delete', comment: comment });
        return;
      }
      const index = this.comments.findIndex(
        (element: CommentPodcast) => element.comId === comment.comId
      );
      if (-1 === index) return;
      this.totalCount -= 1;
      if (0 !== this.dfirst) {
        this.dfirst -= 1;
      }
      this.comments.splice(index, 1);
    },
    updateComment(data: any): void {
      if (
        !this.isFlat &&
        data.comment.commentIdReferer &&
        this.comId !== data.comment.commentIdReferer
      ) {
        const comItem: any = document.getElementsByClassName('comItem' + data.comment.commentIdReferer);
        comItem[0].receiveCommentEvent({ ...data, type: 'Update' });
        return;
      }
      const index = this.comments.findIndex(
        (element: CommentPodcast) => element.comId === data.comment.comId
      );
      if (-1 !== index) {
        if (
          'Valid' !== data.status &&
          (!this.editRight || (this.status && this.status !== data.status))
        ) {
          this.comments.splice(index, 1);
        } else {
          this.comments.splice(index, 1, data.comment);
        }
      } else if (this.status === data.comment.status) {
        this.comments.unshift(data.comment);
      } else if ('Valid' === data.status /* && !this.editRight */) {
        if (this.comments.length > 0) {
          let indexNewComment = -1;
          for (let i = 0, len = this.comments.length; i < len; i++) {
            if (
              moment(this.comments[i].date).isBefore(moment(data.comment.date))
            ) {
              indexNewComment = i;
              break;
            }
          }
          if (-1 !== indexNewComment) {
            if (!this.status || this.status === data.status) {
              this.comments.splice(indexNewComment, 0, data.comment);
            } else {
              this.comments.splice(indexNewComment, 1);
            }
          } else if (!this.status || this.status === data.status) {
            this.comments.push(data.comment);
          }
        } else if (!this.status || this.status === data.status) {
          this.comments.unshift(data.comment);
        }
      }
      if (this.comId && data.status) {
        this.$emit('updateStatus', data.status);
      }
    },
    addNewComment(comment: CommentPodcast, myself = false): void {
      if (!myself && !this.editRight && 'Valid' !== comment.status) {
        return;
      }
      if (
        !this.isFlat &&
        comment.commentIdReferer &&
        this.comId !== comment.commentIdReferer
      ) {
        const comItem: any = document.getElementsByClassName('comItem' + comment.commentIdReferer);
        comItem[0].receiveCommentEvent({ type: 'Create', comment: comment });
        return;
      }
      const index = this.comments.findIndex(
        (element: CommentPodcast) => element.comId === comment.comId
      );
      if (-1 === index) {
        this.totalCount += 1;
        this.dfirst += 1;
        if (!this.status || this.status === comment.status) {
          this.comments.unshift(comment);
        }
      }
    },
  },
  watch: {
    reload(): void {
      this.fetchContent(true);
    },
    status(): void {
      this.fetchContent(true);
    },
    comments(): void {
      this.$emit('fetch', { count: this.totalCount, comments: this.comments });
    },
  },
})
</script>
