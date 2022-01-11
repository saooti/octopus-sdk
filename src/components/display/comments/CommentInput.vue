<template>
  <div
    v-if="isPresent"
    class="d-flex flex-column comment-input-container mt-3"
  >
    <b
      v-if="knownIdentity && !editName"
      class="small-text mt-1 c-hand"
      @click="changeIdentity"
    >{{ knownIdentity }}</b>
    <div
      v-if="editName"
      class="d-flex"
    >
      <input
        v-model="temporaryName"
        class="small-text mt-1"
        type="text"
        :class="{ 'border border-danger': temporaryName.length < 2 }"
      >
      <button
        class="btn"
        @click="editName = false"
      >
        {{ $t('Cancel') }}
      </button>
      <button
        class="btn btn-primary"
        :disabled="temporaryName.length < 2"
        @click="validEdit"
      >
        {{ $t('Validate') }}
      </button>
    </div>
    <textarea
      ref="textarea"
      v-model="newComment"
      :placeholder="placeholder"
      max-rows="10"
      :class="{ short: isOneLine && !newComment.includes('\n') }"
      @focus="textareaFocus = true"
      @blur="textareaFocus = false"
    />
    <div
      v-if="textareaFocus"
      class="d-flex justify-content-end mt-1"
    >
      <button
        class="btn me-2"
        @mousedown="cancelAction"
      >
        {{ $t('Cancel') }}
      </button>
      <button
        class="btn btn-primary"
        :disabled="0 === newComment.trim().length"
        @mousedown="requestToSend"
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
      :validatetext="$t('Close')"
      :title="$t('Error')"
      :message="$t('Error occurs while post your comment...')"
      @close="postError = false"
      @validate="postError = false"
    />
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import commentApi from '@/api/comments';
import { cookies } from '../../mixins/functions';
import { state } from '../../../store/paramStore';
import { Podcast } from '@/store/class/general/podcast';
import { Conference } from '@/store/class/conference/conference';
import { CommentPodcast } from '@/store/class/general/comment';

import { defineComponent, defineAsyncComponent } from 'vue';
const AddCommentModal = defineAsyncComponent(() => import('./AddCommentModal.vue'));
const MessageModal = defineAsyncComponent(() => import('../../misc/modal/MessageModal.vue'));
export default defineComponent({
  name: 'CommentInput',
  components: {
    AddCommentModal,
    MessageModal,
  },
  mixins:[cookies],

  props: {
    podcast: { default: undefined, type: Object as ()=>Podcast },
    knownIdentity: { default: undefined, type: String },
    focus: { default: false, type: Boolean },
    comment: { default: undefined, type: Object as ()=>CommentPodcast },
    fetchConference: { default: undefined, type: Object as ()=>Conference },
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
        podcastComment = (this.podcast.annotations.COMMENTS as string);
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
    isCertified(): boolean {
      if (
        (state.generalParameters.isCommments &&
        state.generalParameters.organisationId === this.podcastOrga) ||
        state.generalParameters.isAdmin
      ){
        return true;
      } 
      return false;
    },
    userId(): string|undefined {
      if (state.generalParameters.authenticated) return this.$store.state.profile.userId;
      return undefined;
    },
    phase(): string|undefined {
      if(undefined === this.podcast){
        return this.comment ? this.comment.phase : undefined;
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
      const commentOrga = this.comment ? this.comment.organisationId : '';
      return this.podcast ? this.podcast.organisation.id : commentOrga;
    }
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
        (this.$refs.textarea as HTMLElement).clientWidth -
          this.inputExceeded(
            this.newComment,
            '18px Montserrat, sans-serif, Helvetica Neue'
          ) >
        padding;
    },
  },
  methods: {
    changeIdentity(): void {
      if(!this.knownIdentity){return}
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
      if(null === context){
        return 0;
      }
      context.font = font;
      return context.measureText(text).width;
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
    defineTimelineValue(): number{
      let timeline = 0;
      if (
        undefined !== this.podcast &&(
        (this.$store.state.player.podcast &&
          this.$store.state.player.podcast.podcastId ===
            this.podcast.podcastId) ||
        (this.$store.state.player.live &&
          this.$store.state.player.live.livePodcastId ===
            this.podcast.podcastId))
      ) {
        timeline = Math.round(
          this.$store.state.player.elapsed * this.$store.state.player.total
        );
        if (this.podcast.duration && this.$store.state.player.podcast) {
          timeline = Math.round(
            timeline -
              (this.$store.state.player.total - this.podcast.duration / 1000)
          );
        }
        if (timeline < 0) {
          timeline = 0;
        }
      }
      return timeline;
    },
    async postComment(name?: string): Promise<void> {
      if (name) {
        this.setCookie('comment-octopus-name', name);
        this.$emit('update:knownIdentity', name);
      }
      const sendName = name ? name: this.knownIdentity;
      const commentPodcastId = this.comment ? this.comment.podcastId : 0;
      const comment: CommentPodcast = {
        content: this.newComment,
        name: sendName ? sendName : '',
        podcastId: this.podcast ? this.podcast.podcastId : commentPodcastId,
        timeline: this.defineTimelineValue(),
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
      } catch (error) {
        this.postError = true;
      }
      this.checkIdentityModal = false;
    },
  },
})
</script>

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
    outline-width: 0 !important;
    border-top: 0;
    border-right: 0;
    border-left: 0;
    border-bottom: 0.1rem solid #ddd !important;
    overflow: hidden !important;
    box-shadow: unset !important;
    background: transparent !important;
    height: 50px;
    &.short{
      max-height: 38px;
    }
  }
}
</style>