<template>
  <div
    v-if="isComments"
    class="module-box"
  >
    <div class="d-flex align-items-center">
      <h2 class="mb-0 me-2" data-selenium="episode-comment-counter">{{commentTitle}}</h2>
      <button
        v-if="!isLive"
        :title="$t('Refresh')"
        class="btn admin-button saooti-refresh-stud"
        @click="reload = !reload"
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

<script lang="ts">
import CommentList from './CommentList.vue';
import CommentInput from './CommentInput.vue';
import { cookies } from '../../mixins/functions';
import { Podcast } from '@/store/class/general/podcast';
import { Conference } from '@/store/class/conference/conference';

import { defineComponent } from 'vue'
import CommentListVue from './CommentList.vue';
import { CommentPodcast } from '@/store/class/general/comment';
export default defineComponent({
  name: 'CommentSection',
  components: {
    CommentList,
    CommentInput,
  },
  mixins:[cookies],
  props: {
    podcast: { default: undefined, type: Object as ()=>Podcast },
    fetchConference: { default: undefined, type: Object as ()=>Conference },
  },
  data() {
    return {
      totalCount: 0 as number,
      loaded: false as boolean,
      reload: false as boolean,
    };
  },
  computed: {
    commentTitle():string{
      const count = this.loaded && this.totalCount > 0 ? this.$t('()', { nb: this.totalCount }) : '';
      return this.$t("Podcast's comments")+count;
    },
    isComments(): boolean {
      if (!this.podcast) return true;
      let podcastComment = 'INHERIT';
      if (this.podcast.annotations && this.podcast.annotations.COMMENTS) {
        podcastComment = (this.podcast.annotations.COMMENTS as string);
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
    updateFetch(value: { count: number, comments: Array<CommentPodcast> }): void {
      this.loaded = true;
      this.$store.commit('setCommentLoaded', {
        ...value,
        podcastId: this.podcast? this.podcast.podcastId: undefined,
      });
      this.totalCount = value.count;
    },
    newComment(comment: CommentPodcast): void {
      (this.$refs.commentList as InstanceType<typeof CommentListVue>).addNewComment(comment, true);
    },
    receiveCommentEvent(event: {type: string; comment: CommentPodcast; oldStatus?:string }): void {
      const commentList = (this.$refs.commentList as InstanceType<typeof CommentListVue>);
      switch (event.type) {
        case 'Create':commentList.addNewComment(event.comment);break;
        case 'Update':commentList.updateComment(event);break;
        case 'Delete':commentList.deleteComment(event.comment);break;
        default:break;
      }
    },
  },
})
</script>