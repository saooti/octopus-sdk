<template>
  <div class="d-flex flex-column mt-3">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading content ...') }}</h3>
    </div>
    <div class="text-danger align-self-center" v-if="error">{{$t('Comments loading error')}}</div>
    <transition-group tag="div" name="comment-list" class="d-flex flex-column my-transition-list-comments" v-show="loaded">
      <CommentItem
        :ref="'comItem'+c.comId"
        :isFlat="isFlat"
        :comment.sync="c"
        :podcast="podcast"
        :fetchConference="fetchConference"
        :organisation="organisation"
        v-for="c in comments"
        :key="c.comId"
        @deleteComment="deleteComment(c)"
        @updateComment="updateComment"
      />
    </transition-group>
    <a
      class="btn btn-primary mt-2"
      :class="comId? 'align-self-start':'align-self-center'"
      @click="displayMore"
      v-show="!allFetched && loaded"
      :aria-label="$t('See more comments')"
    >{{$t('See more comments')}}
    </a>
  </div>
</template>

<style lang="scss">
@import '../../../sass/_variables.scss';
.my-transition-list-comments{
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

<script>
import {state} from "../../../store/paramStore.js";
import octopusApi from "@saooti/octopus-api";
const moment = require('moment');

export default {
  name: 'CommentList',

  props:  {
    first: { default: 0 },
    size: { default: 50 },
    podcast: {default:undefined},
    comId: {default:undefined},
    reload:{default:false},
    fetchConference:{default:undefined},
    organisation:{default:undefined},
    status:{default:undefined},
    isFlat:{default:false},
  },

  components: {
    CommentItem: () => import('./CommentItem.vue')
  },

  created() {
    this.fetchContent(true);
  },

  data() {
    return {
      loading: true,
      loaded: true,
      error:false,
      dfirst: this.$props.first,
      dsize: this.$props.size,
      totalCount: 0,
      comments: [],
    };
  },

  computed: {
    allFetched() {
      return this.dfirst >= this.totalCount;
    },
    organisationId(){
      return state.generalParameters.organisationId;
    },
    podcastId(){
      if(this.podcast)
        return this.podcast.podcastId;
      return undefined;
    },

    editRight() {
      if (( state.generalParameters.isCommments && ((this.podcast && this.organisationId === this.podcast.organisation.id) || (this.organisationId === this.organisation))) || state.generalParameters.isAdmin)
        return true;
      return false;
    },
  },

  methods: {
    async fetchContent(reset) {
      this.resetData(reset);
      let data; 
      try {
        if(this.comId){
          data = await octopusApi.fetchCommentAnswers(this.comId);
        }else{
          let param = {
            first: this.dfirst,
            size: this.dsize,
            podcastId: this.podcastId,
            status:this.status,
          }
          if(!this.editRight){
            param.status = "Valid";
          }
          if(this.podcastId === undefined){
            param.organisationId = this.organisation;
          }
          if(!this.isFlat){
            data = await octopusApi.fetchRootComments(param);
          }else{
            data = await octopusApi.fetchComments(param);
          }
        }
        
        this.resetData(reset);
        this.loading = false;
        this.loaded = true;
        this.totalCount = data.totalElements;
        this.comments = this.comments.concat(data.content).filter((c)=>{
          return c!== null;
        });
        this.dfirst += this.dsize;
      } catch (error) {
        this.loading = false;
        this.error = true;
      }
    },

    resetData(reset){
      if(!reset)
        return;
      this.comments = [];
      this.dfirst = 0;
      this.loading = true;
      this.loaded = false;
    },
    displayMore(event) {
      event.preventDefault();
      this.fetchContent(false);
    },
    deleteComment(comment){
      if(!this.isFlat && comment.commentIdReferer && this.comId !== comment.commentIdReferer){
        this.$refs['comItem'+comment.commentIdReferer][0].receiveCommentEvent({type:"Delete", comment: comment});
        return;
      }
      let index = this.comments.findIndex(element => element.comId === comment.comId);
      if(index == -1)
        return;
      this.totalCount -=1; 
      if(this.dfirst !==0){
        this.dfirst -=1;
      }
      this.comments.splice(index, 1);
    },
    updateComment(data){
      if(!this.isFlat && data.comment.commentIdReferer && this.comId !== data.comment.commentIdReferer){
        this.$refs['comItem'+data.comment.commentIdReferer][0].receiveCommentEvent({...data, type:"Update"});
        return;
      }
      let index = this.comments.findIndex(element => element.comId === data.comment.comId);
      if(index !== -1){
        if(data.status !== "Valid" && (!this.editRight ||(this.status && this.status !== data.status))){
          this.comments.splice(index, 1);
        }else{
          this.comments.splice(index, 1, data.comment);
        }
      }else if(this.status === data.comment.status){
        this.comments.unshift(data.comment);
      }else if(data.status === "Valid" /* && !this.editRight */){
        if(this.comments.length > 0){
          let indexNewComment = -1;
          for (let i=0; i<this.comments.length; i++) {
            if(moment(this.comments[i].date).isBefore(moment(data.comment.date))){
              indexNewComment = i;
              break;
            }
          }
          if(indexNewComment !== -1){
            if(!this.status || this.status === data.status){
              this.comments.splice(indexNewComment, 0, data.comment);
            }else{
              this.comments.splice(indexNewComment, 1);
            }
          }else if(!this.status || this.status === data.status){
            this.comments.push(data.comment);
          }
        }else if(!this.status || this.status === data.status){
          this.comments.unshift(data.comment);
        }
      }
      if(this.comId && data.status){
        this.$emit('updateStatus', data.status);
      }
    },
    addNewComment(comment, myself = false){
      if(!myself && !this.editRight && comment.status !=="Valid"){
        return;
      }
      if(!this.isFlat && comment.commentIdReferer && this.comId !== comment.commentIdReferer){
        this.$refs['comItem'+comment.commentIdReferer][0].receiveCommentEvent({type:"Create", comment: comment});
        return;
      }
      let index = this.comments.findIndex(element => element.comId === comment.comId);
      if(index === -1){
        this.totalCount +=1; 
        this.dfirst +=1;
        if(!this.status || this.status === comment.status){
          this.comments.unshift(comment);
        }
      }
    }
  },

  watch: {
    reload(){
      this.fetchContent(true);
    },
    status(){
      this.fetchContent(true);
    },
    comments(){
      this.$emit("fetch", {count:this.totalCount, comments:this.comments});
    }
  },
};
</script>
