<template>
  <div class="d-flex flex-column mt-2 mb-1 item-comment">
    <CommentBasicView
      v-if="!isEditing"
      :comment="comment"
      :edit-right="editRight"
      :recording-in-live="recordingInLive"
    />
    <template v-else>
      <input
        ref="focusElement"
        v-model="temporaryName"
        class="form-input"
        type="text"
        :class="{ 'border border-danger': 0 === countName || !validName }"
      >
      <p
        class="d-flex justify-content-end h6"
        :class="{ 'text-danger': !validName }"
      >
        {{ countName + ' / ' + maxName }}
      </p>
      <textarea
        v-model="temporaryContent"
        :class="{ 'border border-danger': 0 === countComment || !validComment }"
        class="form-input"
        type="text"
      />
      <p
        class="d-flex justify-content-end h6"
        :class="{ 'text-danger': !validComment }"
      >
        {{ countComment + ' / ' + maxComment }}
      </p>
      <div class="d-flex justify-content-end">
        <button
          class="btn m-1"
          @click="isEditing = false"
        >
          {{ $t('Cancel') }}
        </button>
        <button
          class="btn btn-primary m-1"
          :disabled="0 === countComment || !validComment || 0 === countName || !validName"
          @click="validEdit"
        >
          {{ $t('Validate') }}
        </button>
      </div>
    </template>
    <div class="d-flex align-items-center mt-1">
      <button
        v-if="null === comment.commentIdReferer && 'Valid'=== comment.status"
        class="btn d-flex align-items-center py-1 px-3 me-2"
        :data-selenium="'answer-button-comment-' + seleniumFormat(comment.name)"
        @click="answerComment"
      >
        {{ $t('To answer') }}
      </button>
      <button
        v-if="
          (!isFlat && comment.relatedComments) ||
            (isFlat && comment.commentIdReferer)
        "
        class="btn py-1 d-flex align-items-center px-3 me-2"
        @click="collapseVisible=!collapseVisible"
      >
        <span v-if="comment.relatedComments">
          <template v-if="!collapseVisible">
            {{ $t('Display answers', { nb: comment.relatedComments }) }}
            <em v-if="editRight">{{
              $t('(nb valid comment answers)', {
                nb: comment.relatedValidComments,
              })
            }}</em>
          </template>
          <template v-else>
            {{ $t('Hide answers') }}
          </template>
        </span>
        <span v-else>
          {{ $t('In response to') }}
        </span>
        <span 
          :class="collapseVisible? 'arrow-transform': ''"
          class="ms-1 saooti-down"
        />
      </button>
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
    <div
      v-if="collapseVisible"
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
        v-if="isFlat && comment.commentIdReferer"
        :com-id="comment.commentIdReferer"
        :edit-right="editRight"
      />
      <CommentList
        v-if="!isFlat && comment.relatedComments"
        ref="commentList"
        :podcast="podcast"
        :fetch-conference="fetchConference"
        :organisation="organisation"
        :com-id="comment.comId"
        @updateStatus="updateStatus"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { state } from '../../../stores/ParamSdkStore';
import selenium from '../../mixins/selenium';
import displayMethods from '../../mixins/displayMethods';
import { CommentPodcast } from '@/stores/class/general/comment';
import { Podcast } from '@/stores/class/general/podcast';
import { Conference } from '@/stores/class/conference/conference';
import CommentBasicView from './CommentBasicView.vue';
import Constants from '../../../../public/config';
import { useCommentStore } from '@/stores/CommentStore';
import { mapState, mapActions } from 'pinia';
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
    CommentBasicView
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
      collapseVisible: false as boolean,
      focus: false as boolean,
      isEditing: false as boolean,
      temporaryContent: '' as string,
      temporaryName: '' as string,
      maxComment : Constants.MAX_COMMENT as number,
      maxName : Constants.MAX_COMMENT_NAME as number
    };
  },
  computed: {
    ...mapState(useCommentStore, ['commentKnownIdentity']),
    validName(): boolean{
      return this.countName <= this.maxName;
    },
    countName(): number{
      return this.temporaryName.length;
    },
    validComment(): boolean{
      return this.countComment <= this.maxComment;
    },
    countComment(): number{
      return this.temporaryContent.length;
    },
    myOrganisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    editRight(): boolean {
      return (true === state.generalParameters.isCommments &&
        ((this.myOrganisationId === this.podcast?.organisation.id) ||
        this.myOrganisationId === this.organisation)) ||
        true === state.generalParameters.isAdmin;
    },
    knownIdentity: {
      get(): string|null {
        return this.commentKnownIdentity;
      },
      set(value: string|null) {
        this.setCommentIdentity(value);
      },
    },
    recordingInLive(): boolean {
      return (
        undefined!==this.podcast?.conferenceId &&
        0 !== this.podcast.conferenceId &&
        'READY' === this.podcast.processingStatus
      );
    },
  },
  methods: {
    ...mapActions(useCommentStore, ['setCommentIdentity']),
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
        (this.$refs.commentList as InstanceType<typeof CommentList>).addNewComment(comment, true);
      }
    },
    editComment(): void {
      this.temporaryName = this.comment.name && null !== this.comment.name ? this.comment.name : '';
      this.temporaryContent = this.comment.content && null !== this.comment.content ? this.comment.content : '';
      this.isEditing = true;
      this.$nextTick(() => {
        (this.$refs.focusElement as HTMLElement)?.focus();
      });
    },
    validEdit(): void {
      const comment = this.comment;
      comment.content = this.temporaryContent;
      comment.name = this.temporaryName;
      (this.$refs.editBox as InstanceType<typeof EditCommentBox>).updateComment(comment);
    },
    updateStatus(data: string): void {
      const updatedComment = this.comment;
      if(undefined === updatedComment.relatedValidComments){return;}
      if ('Valid' === data) {
        updatedComment.relatedValidComments += 1;
      } else {
        updatedComment.relatedValidComments -= 1;
      }
      this.$emit('update:comment', updatedComment);
    },
    receiveUpdateComment(event: {type: string; comment: CommentPodcast; oldStatus?:string }){
      let updatedStatus = "";
      if (event.comment.status && event.comment.status !== event.oldStatus) {
        updatedStatus = event.comment.status;
      }
      const updatedComment = this.comment;
      if(undefined !== updatedComment.relatedValidComments){
        if ('Invalid' ===updatedStatus) {
          updatedComment.relatedValidComments -= 1;
        } else if ('Valid' === updatedStatus) {
          updatedComment.relatedValidComments += 1;
        }
      }
      this.$emit('update:comment', updatedComment);
    },
    receiveDeleteComment(event: {type: string; comment: CommentPodcast; oldStatus?:string }){
      const deletedComment = this.comment;
      if(undefined !== deletedComment.relatedComments){
        deletedComment.relatedComments -= 1;
      }
      if (undefined !== deletedComment.relatedValidComments && 'Valid' === event.comment.status) {
        deletedComment.relatedValidComments -= 1;
      }
      this.$emit('update:comment', deletedComment);
    },

    receiveCommentEvent(event: {type: string; comment: CommentPodcast; oldStatus?:string }): void {
      switch (event.type) {
        case 'Create':this.newComment(event.comment, true);break;
        case 'Update':
          if (this.$refs.commentList) {
            (this.$refs.commentList as InstanceType<typeof CommentList>).updateComment(event);
            return;
          }
          this.receiveUpdateComment(event);
          break;
        case 'Delete':
          if (this.$refs.commentList) {
            (this.$refs.commentList as InstanceType<typeof CommentList>).deleteComment(event.comment);
            return;
          }
          this.receiveDeleteComment(event);
          break;
        default:
          break;
      }
    },
  },
})
</script>
