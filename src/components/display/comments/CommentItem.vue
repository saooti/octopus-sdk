<template>
  <div class="d-flex flex-column mt-2 mb-1 item-comment">
    <div class="d-flex small-Text">
      <template v-if="!isEditing">
        <b
          v-if="
            recordingInLive &&
              ('Live' === comment.phase || 'Prelive' === comment.phase)
          "
          class="recording-bg me-1 text-light p-01"
        >{{ $t('Live') }}</b>
        <b
          v-if="editRight || comment.status == 'Valid'"
          class="me-2"
        >{{
          comment.name
        }}</b>
        <template v-else>
          <b
            :id="'popover-comment' + comment.comId"
            class="mr-2 text-danger"
          >{{
            comment.name
          }}</b>
          <Popover
            :target="'popover-comment' + comment.comId"
            triggers="hover"
            custom-class="wizard-help"
          >
            {{ $t('Comment waiting') }}
          </Popover>
        </template>
      </template>
      <template v-else>
        <input
          v-model="temporaryName"
          class="form-input me-2 mb-2 width-auto"
          type="text"
          :class="{ 'border border-danger': temporaryName.length < 2 }"
        >
      </template>
      <img
        v-if="comment.certified"
        class="icon-certified"
        src="/img/certified.png"
        :data-selenium="'certified-icon-' + seleniumFormat(comment.name)"
        :title="$t('Certified account')"
      >
      <div class="me-2">
        {{ date }}
      </div>
      <span 
        v-if="editRight" 
        :class="'status-' + comment.status"
        :data-selenium="'status-comment-' + seleniumFormat(comment.name)"
      />
    </div>
    <template v-if="!isEditing">
      <!-- eslint-disable vue/no-v-html -->
      <div v-html="urlify(contentDisplay)" />
      <!-- eslint-enable -->
      <a
        v-if="comment.content.length > 300"
        class="c-hand font-italic"
        @click="summary = !summary"
      >{{ readMore }}</a>
    </template>
    <template v-else>
      <textarea
        v-model="temporaryContent"
        class="form-input"
        type="text"
      />
      <div class="d-flex justify-content-end">
        <button
          class="btn btn-light m-1"
          @click="isEditing = false"
        >
          {{ $t('Cancel') }}
        </button>
        <button
          class="btn btn-primary m-1"
          :disabled="0 === temporaryContent.length || temporaryName.length < 2"
          @click="validEdit"
        >
          {{ $t('Validate') }}
        </button>
      </div>
    </template>
    <div class="d-flex align-items-center mt-1">
      <button
        v-if="null === comment.commentIdReferer && 'Valid' === comment.status"
        class="btn btn-answer primary-color me-2"
        :data-selenium="'answer-button-comment-' + seleniumFormat(comment.name)"
        @click="answerComment"
      >
        {{ $t('To answer') }}
      </button>
      <div
        v-if="
          (!isFlat && comment.relatedComments) ||
            (isFlat && comment.commentIdReferer)
        "
        v-b-toggle="'answers-comment-' + comment.comId"
        class="primary-color c-hand d-flex align-items-center small-Text input-no-outline"
      >
        <div class="d-flex align-items-center when-closed me-2">
          <div v-if="comment.relatedComments">
            {{ $t('Display answers', { nb: comment.relatedComments }) }}
            <i v-if="editRight">{{
              $t('(nb valid comment answers)', {
                nb: comment.relatedValidComments,
              })
            }}</i>
          </div>
          <div v-else>
            {{ $t('In response to') }}
          </div>
          <span class="saooti-arrow_down saooti-arrow_down-margin" />
        </div>
        <div class="d-flex align-items-center when-opened">
          <div v-if="comment.relatedComments">
            {{ $t('Hide answers') }}
          </div>
          <div v-else>
            {{ $t('In response to') }}
          </div>
          <span
            class="saooti-arrow_down saooti-arrow_down-margin arrow-transform me-2"
          />
        </div>
      </div>
      <EditCommentBox
        v-if="editRight"
        ref="editBox"
        :comment="comment"
        :organisation="organisation"
        @deleteComment="deleteComment"
        @updateComment="updateComment"
        @editComment="editComment"
      />
    </div>
    <b-collapse
      :id="'answers-comment-' + comment.comId"
      v-model="collapseVisible"
      class="ms-4"
    >
      <CommentInput
        v-if="!isFlat || (isFlat && !comment.commentIdReferer)"
        v-model:knownIdentity="knownIdentity"
        :focus="focus"
        :podcast="podcast"
        :comment="comment"
        :fetch-conference="fetchConference"
        @cancelAction="collapseVisible = false"
        @newComment="newComment"
      />
      <CommentParentInfo
        v-if="isFlat && comment.commentIdReferer && collapseVisible"
        :com-id="comment.commentIdReferer"
      />
      <CommentList
        v-if="comment.relatedComments && collapseVisible && !isFlat"
        ref="commentList"
        :podcast="podcast"
        :fetch-conference="fetchConference"
        :organisation="organisation"
        :com-id="comment.comId"
        @updateStatus="updateStatus"
      />
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { state } from '../../../store/paramStore';
import { displayMethods, selenium } from '../../mixins/functions';
import { CommentPodcast } from '@/store/class/comment';
import { Podcast } from '@/store/class/podcast';
import { Conference } from '@/store/class/conference';
import moment from 'moment';
import Popover from '../../misc/Popover.vue';
import { defineComponent, defineAsyncComponent } from 'vue';
const CommentInput = defineAsyncComponent(() => import('./CommentInput.vue'));
const CommentParentInfo = defineAsyncComponent(() => import('./CommentParentInfo.vue'));
const EditCommentBox = defineAsyncComponent(() => import('@/components/display/edit/EditCommentBox.vue'));
const CommentList = defineAsyncComponent(() => import('./CommentList.vue'));
export default defineComponent({
  name: 'CommentItem',

  components: {
    CommentInput,
    CommentParentInfo,
    EditCommentBox,
    CommentList,
    Popover
  },

  mixins:[displayMethods, selenium],
  props: {
    comment: { default: ()=>({}), type: Object as ()=>CommentPodcast },
    podcast: { default: undefined, type: Object as ()=>Podcast },
    fetchConference: { default: undefined, type: Object as ()=>Conference },
    organisation: { default: undefined, type: String},
    isFlat: { default: false, type: Boolean },
  },
  emits: ['deleteComment', 'updateComment', 'update:comment'],
  
  data() {
    return {
      summary: true as boolean,
      collapseVisible: false as boolean,
      focus: false as boolean,
      isEditing: false as boolean,
      temporaryContent: '' as string,
      temporaryName: '' as string,
    };
  },
  computed: {
    date(): string {
      if (this.comment.date)
        return moment(this.comment.date).format('D MMMM YYYY HH[h]mm');
      return '';
    },
    limitContent(): string {
      if (!this.comment.content) return '';
      if (this.comment.content.length <= 300) return this.comment.content;
      return this.comment.content.substring(0, 300) + '...';
    },
    readMore(): string {
      if (this.summary) return this.$t('Read more').toString();
      return this.$t('Read less').toString();
    },
    contentDisplay(): string {
      if (this.summary) return this.limitContent;
      return this.comment.content;
    },
    organisationId(): string {
      return state.generalParameters.organisationId;
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
    knownIdentity: {
      get(): string|null {
        return this.$store.state.comments.knownIdentity;
      },
      set(value: string|null) {
        this.$store.commit('setCommentIdentity', value);
      },
    },
    recordingInLive(): boolean {
      return (
        undefined!==this.podcast &&
        undefined!==this.podcast.conferenceId &&
        0 !== this.podcast.conferenceId &&
        'READY' === this.podcast.processingStatus
      );
    },
  },
  methods: {
    answerComment(): void {
      this.collapseVisible = true;
      this.focus = !this.focus;
    },
    deleteComment(): void {
      this.$emit('deleteComment');
    },
    updateComment(data: {type: string; comment: CommentPodcast; status?: string }): void {
      this.isEditing = false;
      this.$emit('updateComment', data);
    },
    newComment(comment: CommentPodcast, fromEvent = false): void {
      if (undefined === this.fetchConference || fromEvent) {
        const updatedComment = this.comment;
        if(undefined !== updatedComment.relatedComments){
          updatedComment.relatedComments += 1;
        }
        if (undefined !== updatedComment.relatedValidComments && 'Valid' === comment.status) {
          updatedComment.relatedValidComments += 1;
        }
        this.$emit('update:comment', updatedComment);
      }
      if (this.$refs.commentList) {
        (this.$refs.commentList as any).addNewComment(comment, true);
      }
    },
    editComment(): void {
      if (this.comment.name && null !== this.comment.name) {
        this.temporaryName = this.comment.name;
      }
      if (this.comment.content && null !== this.comment.content) {
        this.temporaryContent = this.comment.content;
      }
      this.isEditing = true;
    },
    validEdit(): void {
      const comment = this.comment;
      comment.content = this.temporaryContent;
      comment.name = this.temporaryName;
      (this.$refs.editBox as any).updateComment(comment);
    },
    updateStatus(data: string): void {
      const updatedComment = this.comment;
      if(undefined === updatedComment.relatedValidComments){
        return;
      }
      if ('Valid' === data) {
        updatedComment.relatedValidComments += 1;
      } else {
        updatedComment.relatedValidComments -= 1;
      }
      this.$emit('update:comment', updatedComment);
    },
    receiveCommentEvent(event: {type: string; comment: CommentPodcast; status?: string }): void {
      switch (event.type) {
        case 'Create':
          this.newComment(event.comment, true);
          break;
        case 'Update':
          if (this.$refs.commentList) {
            (this.$refs.commentList as any).updateComment({ comment: event.comment });
          } else {
            const updatedComment = this.comment;
            if(undefined !== updatedComment.relatedValidComments){
              if ('Invalid' === event.status) {
                updatedComment.relatedValidComments -= 1;
              } else if ('Valid' === event.status) {
                updatedComment.relatedValidComments += 1;
              }
            }
            
            this.$emit('update:comment', updatedComment);
          }
          break;
        case 'Delete':
          if (this.$refs.commentList) {
            (this.$refs.commentList as any).deleteComment(event.comment);
          } else {
            const updatedComment = this.comment;
            if(undefined !== updatedComment.relatedComments){
              updatedComment.relatedComments -= 1;
            }
            if (undefined !== updatedComment.relatedValidComments && 'Valid' === event.comment.status) {
              updatedComment.relatedValidComments -= 1;
            }
            this.$emit('update:comment', updatedComment);
          }
          break;
        default:
          break;
      }
    },
  },
})
</script>

<style lang="scss"></style>