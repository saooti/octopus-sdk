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
        :class="'comItem' + c.comId"
        :isFlat="isFlat"
        v-model:comment="comments[index]"
        :podcast="podcast"
        :fetchConference="fetchConference"
        :organisation="organisation"
        v-for="(c, index) in comments"
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
  .comment-list-enter-active,
  .comment-list-leave-active {
    transition: 1200ms cubic-bezier(0.59, 0.12, 0.34, 0.95);
    transition-property: opacity, transform;
    background-color: $primaryColorReallyTransparent;
    width: 100%;
  }

  .comment-list-enter {
    opacity: 0;
    transform: translateX(50px) scaleY(0.5);
    background-color: $primaryColorReallyTransparent;
    width: 100%;
  }

  .comment-list-enter-to {
    opacity: 1;
    transform: translateX(0) scaleY(1);
    background-color: $primaryColorReallyTransparent;
    width: 100%;
  }

  .comment-list-leave-active {
    position: absolute;
    background-color: $primaryColorReallyTransparent;
    width: 100%;
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
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'CommentList',

  props: {
    first: { default: 0 },
    size: { default: 50 },
    podcast: { default: undefined as any },
    comId: { default: undefined as any },
    reload: { default: false },
    fetchConference: { default: undefined as any },
    organisation: { default: undefined as any },
    status: { default: undefined as any },
    isFlat: { default: false },
  },

  emits: ['updateStatus', 'fetch'],

  components: {
    CommentItem: () => import('./CommentItem.vue'),
  },

  created() {
    this.fetchContent(true);
  },

  data() {
    return {
      loading: true,
      loaded: true,
      error: false,
      dfirst: this.$props.first,
      dsize: this.$props.size,
      totalCount: 0,
      comments: [] as any,
      inFetching: false,
    };
  },

  computed: {
    allFetched():boolean {
      return this.dfirst >= this.totalCount;
    },
    organisationId() {
      return state.generalParameters.organisationId;
    },
    podcastId():any {
      if (this.podcast) return this.podcast.podcastId;
      return undefined;
    },

    editRight() {
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
    async fetchContent(reset: boolean) {
      this.inFetching = true;
      this.resetData(reset);
      let data;
      try {
        if (this.comId) {
          data = await octopusApi.fetchCommentAnswers(this.comId);
        } else {
          let param :any = {
            first: this.dfirst,
            size: this.dsize,
            podcastId: this.podcastId,
            status: this.status,
          };
          if (!this.editRight) {
            param.status = 'Valid';
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
        this.comments = this.comments.concat(data.content).filter((c:any) => {
          return null !== c;
        });
        this.dfirst += this.dsize;
      } catch (error) {
        this.loading = false;
        this.error = true;
      }
      this.inFetching = false;
    },

    resetData(reset: any) {
      if (!reset) return;
      this.comments.length = 0;
      this.dfirst = 0;
      this.loading = true;
      this.loaded = false;
    },
    displayMore(event: { preventDefault: () => void; }) {
      event.preventDefault();
      this.fetchContent(false);
    },
    deleteComment(comment: { commentIdReferer: string; comId: any; }) {
      if (
        !this.isFlat &&
        comment.commentIdReferer &&
        this.comId !== comment.commentIdReferer
      ) {
        let comItem :any = document.getElementsByClassName('comItem' + comment.commentIdReferer);
        comItem[0].receiveCommentEvent({ type: 'Delete', comment: comment });
        return;
      }
      let index = this.comments.findIndex(
        (element:any) => element.comId === comment.comId
      );
      if (-1 === index) return;
      this.totalCount -= 1;
      if (0 !== this.dfirst) {
        this.dfirst -= 1;
      }
      this.comments.splice(index, 1);
    },
    updateComment(data: any) {
      if (
        !this.isFlat &&
        data.comment.commentIdReferer &&
        this.comId !== data.comment.commentIdReferer
      ) {
        let comItem :any = document.getElementsByClassName('comItem' + data.comment.commentIdReferer);
        comItem[0].receiveCommentEvent({ ...data, type: 'Update' });
        return;
      }
      let index = this.comments.findIndex(
        (element:any) => element.comId === data.comment.comId
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
    addNewComment(comment: { status: string; commentIdReferer: string; comId: any; }, myself = false) {
      if (!myself && !this.editRight && 'Valid' !== comment.status) {
        return;
      }
      if (
        !this.isFlat &&
        comment.commentIdReferer &&
        this.comId !== comment.commentIdReferer
      ) {
        let comItem :any = document.getElementsByClassName('comItem' + comment.commentIdReferer);
        comItem[0].receiveCommentEvent({ type: 'Create', comment: comment });
        return;
      }
      let index = this.comments.findIndex(
        (element:any) => element.comId === comment.comId
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
    reload() {
      this.fetchContent(true);
    },
    status() {
      this.fetchContent(true);
    },
    comments() {
      this.$emit('fetch', { count: this.totalCount, comments: this.comments });
    },
  },
});
</script>
