<template>
  <div
    v-if="isComments"
    class="d-flex flex-column mt-3 module-box comment-item-container"
  >
    <div class="d-flex align-items-center">
      <h2
        class="mb-0 mr-2"
        data-selenium="episode-comment-counter"
      >
        {{ $t("Podcast's comments") }}
        <template v-if="loaded && totalCount > 0">
          {{
            $t('()', { nb: totalCount })
          }}
        </template>
      </h2>
      <button
        v-if="!isLive"
        :aria-label="$t('Refresh')"
        class="saooti-refresh-stud btn btn-reload primary-color"
        @click="reloadComments"
      />
    </div>
    <CommentInput
      v-model:knownIdentity="knownIdentity"
      :podcast="podcast"
      :fetch-conference="fetchConference"
      @newComment="newComment"
    />
    <CommentList
      ref="commentList"
      :podcast="podcast"
      :reload="reload"
      :is-flat="isLive"
      :fetch-conference="fetchConference"
      @fetch="updateFetch"
    />
  </div>
</template>

<style lang="scss">
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
import { Podcast } from '@/store/class/podcast';
import { Conference } from '@/store/class/conference';

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'CommentSection',

  components: {
    CommentList,
    CommentInput,
  },
  mixins:[cookies],

  props: {
    podcast: { default: undefined as Podcast|undefined },
    fetchConference: { default: undefined as Conference|undefined },
  },
  
  data() {
    return {
      totalCount: 0 as number,
      loaded: false as boolean,
      reload: false as boolean,
    };
  },

  computed: {
    isComments(): boolean {
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
      get(): string|null {
        return this.$store.state.comments.knownIdentity;
      },
      set(value: string|null) {
        this.$store.commit('setCommentIdentity', value);
      },
    },
    isLive(): boolean {
      return (
        undefined!==this.fetchConference &&
        -1 !== this.fetchConference.conferenceId &&
        'PUBLISHING' !== this.fetchConference.status &&
        'DEBRIEFING' !== this.fetchConference.status
      );
    },
  },

  created() {
    this.knownIdentity = this.getCookie('comment-octopus-name');
  },
  methods: {
    updateFetch(value: { count: number }): void {
      this.loaded = true;
      this.$store.commit('setCommentLoaded', {
        ...value,
        podcastId: this.podcast.podcastId,
      });
      this.totalCount = value.count;
    },
    reloadComments(): void {
      this.reload = !this.reload;
    },
    newComment(comment: Comment): void {
      (this.$refs.commentList as any).addNewComment(comment, true);
    },
    receiveCommentEvent(event: any): void {
      let statusUpdated = undefined;
      switch (event.type) {
        case 'Create':
          (this.$refs.commentList as any).addNewComment(event.comment);
          break;
        case 'Update':
          if (event.comment.status !== event.oldStatus) {
            statusUpdated = event.comment.status;
          }
          (this.$refs.commentList as any).updateComment({
            comment: event.comment,
            status: statusUpdated,
          });
          break;
        case 'Delete':
          (this.$refs.commentList as any).deleteComment(event.comment);
          break;
        default:
          console.log('Event not handle');
          break;
      }
    },
  },
})
</script>
