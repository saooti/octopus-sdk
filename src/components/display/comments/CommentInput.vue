<template>
  <div class="d-flex flex-column comment-input-container mt-3" v-if="isPresent">
    <b
      class="small-Text mt-1 c-hand"
      @click="changeIdentity"
      v-if="knownIdentity && !editName"
      >{{ knownIdentity }}</b
    >
    <div class="d-flex" v-if="knownIdentity && editName">
      <input
        class="small-Text mt-1"
        type="text"
        v-model="temporaryName"
        v-bind:class="{ 'border border-danger': temporaryName.length < 2 }"
      />
      <button class="btn btn-light p-1 m-1" @click="editName = false">
        {{ $t('Cancel') }}
      </button>
      <button
        class="btn btn-primary p-1 m-1"
        :disabled="temporaryName.length < 2"
        @click="validEdit"
      >
        {{ $t('Validate') }}
      </button>
    </div>
    <b-form-textarea
      ref="textarea"
      v-model="newComment"
      :placeholder="placeholder"
      max-rows="10"
      :class="{ short: isOneLine && !newComment.includes('\n') }"
      @focus="textareaFocus = true"
      @blur="textareaFocus = false"
    ></b-form-textarea>
    <div class="d-flex justify-content-end mt-1" v-if="textareaFocus">
      <button class="btn mr-2" @mousedown="cancelAction">
        {{ $t('Cancel') }}
      </button>
      <button
        class="btn btn-primary"
        @mousedown="requestToSend"
        :disabled="0 === newComment.trim().length"
      >
        {{ placeholder }}
      </button>
    </div>
    <AddCommentModal
      v-if="checkIdentityModal"
      @validate="postComment"
      @close="checkIdentityModal = false"
    />
    <MessageModal
      v-if="postError"
      @close="postError = false"
      @validate="postError = false"
      :validatetext="$t('Close')"
      :title="$t('Error')"
      :message="$t('Error occurs while post your comment...')"
    />
  </div>
</template>

<style lang="scss">
@import '../../../sass/_variables.scss';
.comment-input-container {
  textarea::placeholder {
    color: $octopus-primary-color;
  }
  textarea:focus::placeholder {
    color: black;
  }
  textarea {
    border-top: 0;
    border-right: 0;
    border-left: 0;
    border-bottom: 0.1rem solid #ddd !important;
    overflow: hidden !important;
    box-shadow: unset !important;
    background: transparent !important;
    height: 40px;
  }
  textarea.short {
    max-height: 38px;
  }
}
</style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import commentApi from '@/api/comments';
import { cookies } from '../../mixins/functions';
import { state } from '../../../store/paramStore';
import { Podcast } from '@/store/class/podcast';
import { Conference } from '@/store/class/conference';
import { CommentPodcast } from '@/store/class/comment';

export default{
  name: 'CommentInput',
  mixins:[cookies],
  components: {
    AddCommentModal: () => import('./AddCommentModal.vue'),
    MessageModal: () => import('../../misc/modal/MessageModal.vue'),
  },

  props: {
    podcast: { default: undefined as Podcast|undefined },
    knownIdentity: { default: null as string|null },
    focus: { default: false as boolean },
    comment: { default: undefined as CommentPodcast|undefined },
    fetchConference: { default: undefined as Conference|undefined },
  },
  emits: ['update:knownIdentity', 'cancelAction', 'newComment'],

  data() {
    return {
      newComment: '' as string,
      textareaFocus: false as boolean,
      checkIdentityModal: false as boolean,
      postError: false as boolean,
      isOneLine: true as boolean,
      editName: false as boolean,
      temporaryName: '' as string,
    };
  },

  computed: {
    isPresent(): boolean {
      if (!this.podcast) return true;
      let podcastComment = 'INHERIT';
      if (this.podcast.annotations && this.podcast.annotations.COMMENTS) {
        podcastComment = this.podcast.annotations.COMMENTS;
      }
      let organisationComment = 'LIVE_ONLY';
      if (this.podcast.organisation.comments) {
        organisationComment = this.podcast.organisation.comments;
      }
      if (
        ('LIVE_ONLY' === podcastComment &&
          'READY_TO_RECORD' !== this.podcast.processingStatus) ||
        ('INHERIT' === podcastComment &&
          'LIVE_ONLY' === organisationComment &&
          'READY_TO_RECORD' !== this.podcast.processingStatus)
      ) {
        return false;
      }
      return true;
    },
    placeholder(): string {
      if (this.comment && this.comment.comId) return this.$t('Answer a comment').toString();
      return this.$t('Write a comment').toString();
    },
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    isCertified(): boolean {
      if (
        (state.generalParameters.isCommments &&
          this.organisationId === this.podcastOrga) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    userId(): string|undefined {
      if (this.authenticated) return this.$store.state.profile.userId;
      return undefined;
    },
    phase(): string|undefined {
      if(undefined === this.podcast){
        return this.comment.phase;
      }
      if (
        !this.podcast.conferenceId ||
        0 === this.podcast.conferenceId ||
        'READY_TO_RECORD' !== this.podcast.processingStatus
      )
        return 'Podcast';
      if (
        this.fetchConference &&
        ('PLANNED' === this.fetchConference.status ||
          'PENDING' === this.fetchConference.status)
      )
        return 'Prelive';
      return 'Live';
    },
    podcastOrga(): string|undefined{
      return this.podcast ? this.podcast.organisation.id : this.comment.organisationId;
    }
  },
  methods: {
    changeIdentity(): void {
      this.temporaryName = this.knownIdentity;
      this.editName = true;
    },
    validEdit(): void {
      this.setCookie('comment-octopus-name', this.temporaryName);
      this.$emit('update:knownIdentity', this.temporaryName);
      this.editName = false;
    },
    inputExceeded(text: string, font: string): number {
      const element = document.createElement('canvas');
      const context = element.getContext('2d');
      context!.font = font;
      return context!.measureText(text).width;
    },
    requestToSend(): void {
      if (this.knownIdentity) {
        this.postComment();
      } else {
        this.checkIdentityModal = true;
      }
    },
    cancelAction(): void {
      this.$emit('cancelAction');
    },
    async postComment(name?: string): Promise<void> {
      if (name) {
        this.setCookie('comment-octopus-name', name);
        this.$emit('update:knownIdentity', name);
      }
      let timeline = 0;
      if (
        (this.$store.state.player.podcast &&
          this.$store.state.player.podcast.podcastId ===
            this.podcast.podcastId) ||
        (this.$store.state.player.live &&
          this.$store.state.player.live.livePodcastId ===
            this.podcast.podcastId)
      ) {
        timeline = Math.round(
          this.$store.state.player.elapsed! * this.$store.state.player.total!
        );
        if (this.podcast.duration && this.$store.state.player.podcast) {
          timeline = Math.round(
            timeline -
              (this.$store.state.player.total! - this.podcast.duration / 1000)
          );
        }
        if (timeline < 0) {
          timeline = 0;
        }
      }
      let sendName = this.knownIdentity;
      if (null === sendName && name) {
        sendName = name;
      }
      const comment: any = {
        content: this.newComment,
        name: sendName,
        podcastId: this.podcast ? this.podcast.podcastId : this.comment.podcastId,
        timeline: timeline,
        organisationId: this.podcastOrga,
        commentIdReferer: this.comment ? this.comment.comId : undefined,
        certified: this.isCertified,
        userId: this.userId,
        phase: this.phase,
      };
      try {
        let data;
        if (this.isCertified) {
          comment.status = 'Valid';
          data = await commentApi.postComment(this.$store.state, comment);
        } else {
          data = await octopusApi.postComment(comment);
        }
        this.$emit('newComment', data);
        this.newComment = '';
        this.checkIdentityModal = false;
      } catch (error) {
        this.checkIdentityModal = false;
        this.postError = true;
      }
    },
  },
  watch: {
    textareaFocus(): void {
      this.newComment = this.newComment.trim();
    },
    focus(): void {
      (this.$refs.textarea as HTMLElement).focus();
    },
    newComment(): void {
      const padding =
        1.5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      this.isOneLine =
        (this.$refs.textarea as any).$el.clientWidth -
          this.inputExceeded(
            this.newComment,
            '18px Montserrat, sans-serif, Helvetica Neue'
          ) >
        padding;
    },
  },
};
</script>
