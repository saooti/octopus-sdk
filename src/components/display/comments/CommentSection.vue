<template>
  <div
    class="d-flex flex-column mt-3 module-box comment-item-container"
    v-if="isComments"
  >
    <div class="d-flex align-items-center">
      <h2 class="mb-0 mr-2">
        {{ $t("Podcast's comments") }}
        <template v-if="loaded && totalCount > 0">{{
          $t('()', { nb: totalCount })
        }}</template>
      </h2>
      <button
        class="saooti-refresh-stud btn btn-reload primary-color"
        @click="reloadComments"
        v-if="!isLive"
      ></button>
    </div>
    <CommentInput
      :podcast="podcast"
      v-model:knownIdentity="knownIdentity"
      :fetchConference="fetchConference"
      @newComment="newComment"
    />
    <CommentList
      ref="commentList"
      :podcast="podcast"
      :reload="reload"
      :isFlat="isLive"
      :fetchConference="fetchConference"
      @fetch="updateFetch"
    />
  </div>
</template>

<style lang="scss">
@import '../../../sass/_variables.scss';
.btn-reload {
  width: 40px;
  height: 40px;
  padding: 0;
  font-size: 1rem;
  font-weight: bold;
}
</style>

<script lang="ts">
import CommentList from './CommentList.vue';
import CommentInput from './CommentInput.vue';
import { cookies } from '../../mixins/functions';
import store from '@/store/AppStore';
import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'CommentSection',

  props: {
    podcast: { default: undefined as any },
    fetchConference: { default: undefined as any },
  },

  mixins: [cookies],

  components: {
    CommentList,
    CommentInput,
  },
  setup() {
    const commentList : any = ref(null);
    return {
      commentList,
    };
  },

  created() {
    this.knownIdentity = this.getCookie('comment-octopus-name');
  },

  data() {
    return {
      totalCount: 0,
      loaded: false,
      reload: false,
    };
  },

  computed: {
    isComments():boolean {
      if (!this.podcast) return true;
      let podcastComment = 'INHERIT';
      if (this.podcast.annotations && this.podcast.annotations.COMMENTS) {
        podcastComment = this.podcast.annotations.COMMENTS;
      }
      let organisationComment = 'LIVE_ONLY';
      if (this.podcast.organisation.comments) {
        organisationComment = this.podcast.organisation.comments;
      }
      return !(
        'NO' === podcastComment ||
        ('INHERIT' === podcastComment && 'NO' === organisationComment) ||
        ('LIVE_RECORD' === podcastComment &&
          'READY_TO_RECORD' !== this.podcast.processingStatus) ||
        ('INHERIT' === podcastComment &&
          'LIVE_ONLY' === organisationComment &&
          !this.podcast.conferenceId &&
          0 !== this.podcast.conferenceId)
      );
    },
    knownIdentity: {
      get() {
        return store.state.comments.knownIdentity;
      },
      set(value: any) {
        store.commit('setCommentIdentity', value);
      },
    },
    isLive():boolean {
      return (
        this.fetchConference &&
        'null' !== this.fetchConference &&
        'PUBLISHING' !== this.fetchConference.status &&
        'DEBRIEFING' !== this.fetchConference.status
      );
    },
  },

  methods: {
    updateFetch(value: { count: number; }) {
      this.loaded = true;
      store.commit('setCommentLoaded', {
        ...value,
        podcastId: this.podcast.podcastId,
      });
      this.totalCount = value.count;
    },
    reloadComments() {
      this.reload = !this.reload;
    },
    newComment(comment: any) {
      this.commentList.addNewComment(comment, true);
    },
    receiveCommentEvent(event: { type: any; comment: { status: any; }; oldStatus: any; }) {
      let statusUpdated = undefined;
      switch (event.type) {
        case 'Create':
          this.commentList.addNewComment(event.comment);
          break;
        case 'Update':
          if (event.comment.status !== event.oldStatus) {
            statusUpdated = event.comment.status;
          }
          this.commentList.updateComment({
            comment: event.comment,
            status: statusUpdated,
          });
          break;
        case 'Delete':
          this.commentList.deleteComment(event.comment);
          break;
        default:
          console.log('Event not handle');
          break;
      }
    },
  },
});
</script>
