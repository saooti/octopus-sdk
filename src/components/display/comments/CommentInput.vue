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
import AddCommentModal from './AddCommentModal.vue';
import MessageModal from '../../misc/modal/MessageModal.vue';
const octopusApi = require('@saooti/octopus-api');
import commentApi from '@/api/comments';
import store from '@/store/AppStore';
import { cookies } from '../../mixins/functions';
import { state } from '../../../store/paramStore.js';

import { defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'CommentInput',

  props: {
    podcast: { default: undefined as any },
    knownIdentity: { default: null as any },
    focus: { default: false },
    comId: { default: undefined as any },
    fetchConference: { default: undefined as any },
  },

  mixins: [cookies],

  components: {
    AddCommentModal,
    MessageModal,
  },

  setup() {
    const textarea : any = ref(null);
    return {
      textarea,
    };
  },

  data() {
    return {
      newComment: '',
      textareaFocus: false,
      checkIdentityModal: false,
      postError: false,
      isOneLine: true,
      editName: false,
      temporaryName: '',
    };
  },

  computed: {
    isPresent() {
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
    placeholder():string {
      if (this.comId) return this.$t('Answer a comment');
      return this.$t('Write a comment');
    },
    organisationId() {
      return state.generalParameters.organisationId;
    },
    authenticated() {
      return state.generalParameters.authenticated;
    },
    isCertified() {
      if (
        (state.generalParameters.isCommments &&
          this.organisationId === this.podcast.organisation.id) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    userId():any {
      if (this.authenticated) return store.state.profile.userId;
      return undefined;
    },
    phase() {
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
  },

  methods: {
    changeIdentity() {
      this.temporaryName = this.knownIdentity;
      this.editName = true;
    },
    validEdit() {
      this.setCookie('comment-octopus-name', this.temporaryName);
      this.$emit('update:knownIdentity', this.temporaryName);
      this.editName = false;
    },
    inputExceeded(text: string, font: string) {
      let element = document.createElement('canvas');
      let context = element.getContext('2d');
      context!.font = font;
      return context!.measureText(text).width;
    },
    requestToSend() {
      if (this.knownIdentity) {
        this.postComment();
      } else {
        this.checkIdentityModal = true;
      }
    },
    cancelAction() {
      this.$emit('cancelAction');
    },
    async postComment(name?: string) {
      if (name) {
        this.setCookie('comment-octopus-name', name);
        this.$emit('update:knownIdentity', name);
      }
      let timeline = 0;
      if (
        (store.state.player.podcast &&
          store.state.player.podcast.podcastId ===
            this.podcast.podcastId) ||
        (store.state.player.live &&
          store.state.player.live.livePodcastId ===
            this.podcast.podcastId)
      ) {
        timeline = Math.round(
          store.state.player.elapsed * store.state.player.total
        );
        if (this.podcast.duration && store.state.player.podcast) {
          timeline = Math.round(
            timeline -
              (store.state.player.total - this.podcast.duration / 1000)
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
      let comment:any = {
        content: this.newComment,
        name: sendName,
        podcastId: this.podcast.podcastId,
        timeline: timeline,
        organisationId: this.podcast.organisation.id,
        commentIdReferer: this.comId,
        certified: this.isCertified,
        userId: this.userId,
        phase: this.phase,
      };
      try {
        let data;
        if (this.isCertified) {
          comment.status = 'Valid';
          data = await commentApi.postComment(store, comment);
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
    textareaFocus() {
      this.newComment = this.newComment.trim();
    },
    focus() {
      this.textarea.focus();
    },
    newComment() {
      let padding =
        1.5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      this.isOneLine =
        this.textarea.$el.clientWidth -
          this.inputExceeded(
            this.newComment,
            '18px Montserrat, sans-serif, Helvetica Neue'
          ) >
        padding;
    },
  },
});
</script>
