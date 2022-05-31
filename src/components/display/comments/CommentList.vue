<template>
  <div class="d-flex flex-column mt-3">
    <ClassicLoading
      :loading-text="loading?$t('Loading content ...'):undefined"
      :error-text="error?$t(`Comments loading error`):undefined"
    />
    <div
      v-show="!loading"
    >
      <CommentItem
        v-for="(c, indexCom) in comments"
        :ref="'comItem' + c.comId"
        :key="c.comId"
        v-model:comment="comments[indexCom]"
        :is-flat="isFlat"
        :podcast="podcast"
        :fetch-conference="fetchConference"
        :organisation="organisation"
        @deleteComment="deleteComment(c)"
        @updateComment="updateComment"
      />
    </div>
    <button
      v-show="!allFetched && (!loading || 0!==first)"
      class="btn btn-primary mt-2"
      :class="comId ? 'align-self-start' : 'align-self-center'"
      :disabled="loading"
      :title="$t('See more comments')"
      @click="fetchContent(false)"
    >
      {{ $t('See more comments') }}
    </button>
  </div>
</template>

<script lang="ts">
import ClassicLoading from '../../form/ClassicLoading.vue';
import { state } from '../../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
import moment from 'moment';
import { Podcast } from '@/store/class/general/podcast';
import { Conference } from '@/store/class/conference/conference';
import { CommentPodcast } from '@/store/class/general/comment';
import { defineComponent, defineAsyncComponent } from 'vue';
import { FetchParam } from '@/store/class/general/fetchParam';
/* eslint-disable */
const CommentItem: any = defineAsyncComponent(() => import('./CommentItem.vue'));
/* eslint-enable */
export default defineComponent({
  name: 'CommentList',

  components: {
    CommentItem,
    ClassicLoading
  },

  props: {
    podcast: { default: undefined, type: Object as ()=>Podcast},
    comId: { default: undefined, type: Number },
    reload: { default: false, type: Boolean},
    fetchConference: { default: undefined, type: Object as ()=>Conference},
    organisation: { default: undefined, type: String},
    status: { default: undefined, type: String},
    isFlat: { default: false, type: Boolean},
  },
  emits: ['updateStatus', 'fetch'],

  data() {
    return {
      loading: true as boolean,
      error: false as boolean,
      first:0 as number,
      size: 20 as number,
      totalCount: 0 as number,
      comments: [] as Array<CommentPodcast>,
    };
  },

  computed: {
    allFetched(): boolean {
      return this.first >= this.totalCount;
    },
    myOrganisationId(): string|undefined {
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
            this.myOrganisationId === this.podcast.organisation.id) ||
            this.myOrganisationId  === this.organisation)) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
  },
  watch: {
    reload(): void {
      this.fetchContent();
    },
    status(): void {
      this.fetchContent();
    },
    comments: {
      deep: true,
      handler(){
        this.$emit('fetch', { count: this.totalCount, comments: this.comments });
      }
    },
  },
  created() {
    this.fetchContent();
  },
  methods: {
    async fetchContent(reset=true): Promise<void> {
      this.loading = true;
      this.error = false;
      if(reset){
        this.first = 0;
      }
      let data;
      try {
        if (this.comId) {
          data = await octopusApi.fetchCommentAnswers(this.comId, {first: this.first,size: this.size});
        }else{
          const param: FetchParam = {
            first: this.first,
            size: this.size,
            podcastId: this.podcastId,
            status:this.editRight && this.status?[this.status]: this.editRight? ['Valid','Pending', 'Invalid']:['Valid'],
            organisationId: undefined === this.podcastId? this.organisation: undefined,
          };
          if (!this.isFlat) {
            data = await octopusApi.fetchRootComments(param);
          } else {
            data = await octopusApi.fetchComments(param);
          }
        }
        if(reset){
          this.comments.length = 0;
        }
        this.totalCount = data.totalElements;
        this.comments = this.comments.concat(data.content).filter((c: CommentPodcast) => {
          return null !== c;
        });
        this.first += this.size;
      } catch {
        this.error = true;
      }
      this.loading = false;
    },
    findCommentIndex(comId: number|undefined): number{
      return this.comments.findIndex(
        (element: CommentPodcast) => element.comId === comId
      );
    },
    commentIsNotInList(commentIdReferer:undefined|number):boolean{
      return !this.isFlat && undefined!==commentIdReferer && null!==commentIdReferer && this.comId !==commentIdReferer;
    },
    deleteComment(comment: CommentPodcast): void {
      if (this.commentIsNotInList(comment.commentIdReferer)){
        const comItem = (this.$refs['comItem' + comment.commentIdReferer] as Array<InstanceType<typeof CommentItem>>)[0];
        comItem.receiveCommentEvent({ type: 'Delete', comment: comment });
        return;
      }
      const index = this.findCommentIndex(comment.comId);
      if (-1 === index) return;
      this.totalCount -= 1;
      if (0 !== this.first) {
        this.first -= 1;
      }
      this.comments.splice(index, 1);
    },
    updateComment(data: {type: string; comment: CommentPodcast; oldStatus?:string }): void {
      if (this.commentIsNotInList(data.comment.commentIdReferer)){
        const comItem = (this.$refs['comItem' + data.comment.commentIdReferer] as Array<InstanceType<typeof CommentItem>>)[0];
        comItem.receiveCommentEvent(data);
        return;
      }
      const index = this.findCommentIndex(data.comment.comId);
      if (-1 !== index) {
        if ((!this.editRight && 'Valid' !== data.comment.status) ||
          (this.editRight && this.status && this.status !== data.comment.status)) {
          this.comments.splice(index, 1);
        } else {
          this.comments.splice(index, 1, data.comment);
        }
      }else if((!this.editRight && 'Valid' === data.comment.status) ||
              (this.editRight && !this.status) ||
              (this.editRight && this.status && this.status === data.comment.status)){
        let indexNewComment = 0;
        for (let i = 0, len = this.comments.length; i < len; i++) {
          if (
            moment(this.comments[i].date).isBefore(moment(data.comment.date))
          ) {
            indexNewComment = i;
            break;
          }
        }
        this.comments.splice(indexNewComment, 0, data.comment);
      }
      if (this.comId && data.oldStatus!==data.comment.status) {
        this.$emit('updateStatus', data.comment.status);
      }
    },
    addNewComment(comment: CommentPodcast, myself = false): void {
      if (!myself && !this.editRight && 'Valid' !== comment.status) {
        return;
      }
      if (this.commentIsNotInList(comment.commentIdReferer)){
        const comItem = (this.$refs['comItem' + comment.commentIdReferer] as Array<InstanceType<typeof CommentItem>>)[0];
        comItem.receiveCommentEvent({ type: 'Create', comment: comment });
        return;
      }
      const index = this.findCommentIndex(comment.comId);
      if (-1 === index) {
        this.totalCount += 1;
        this.first += 1;
        if (!this.status || this.status === comment.status) {
          this.comments.unshift(comment);
        }
      }
    },
  },
})
</script>

<style lang="scss">
@import '../../../sass/_variables.scss';
.octopus-app{

}
</style>