<template>
  <div class="d-flex flex-column mt-3">
    <div class="d-flex small-Text">
      <template v-if="!isEditing">
			  <b class="mr-2">{{comment.name}}</b>
      </template>
      <template v-else>
        <input
          class="form-input mr-2 width-auto"
          type="text"
          v-model="temporaryName"
          v-bind:class="{'border border-danger': temporaryName.length < 2}"
        />
      </template>
      <img class="icon-certified" src="/img/certified.png" v-if="comment.certified" :title="$t('Certified account')"/>
			<div class="mr-2">{{date}}</div>
      <span v-if="editRight" :class="'status-'+comment.status"></span>
		</div>
    <template v-if="!isEditing">
      <div >{{contentDisplay}}</div>
      <a class="c-hand font-italic" v-if="comment.content.length > 300" @click="summary = !summary">{{readMore}}</a>
    </template>
    <template v-else>
      <textarea
        class="form-input"
        type="text"
        v-model="temporaryContent"
      />
      <div class="d-flex justify-content-end">
        <button class="btn btn-light m-1" @click="isEditing = false;">{{ $t('Cancel') }}</button>
        <button class="btn btn-primary m-1" :disabled="temporaryContent.length ===0 && temporaryName.length < 2" @click="validEdit">{{ $t('Validate') }}</button>
      </div>
    </template>
		<div class="d-flex align-items-center mt-1">
			<button 
      @click="answerComment"
      class="btn btn-answer primary-color mr-2"
      v-if="comment.commentIdReferer ===null && comment.status ==='Valid'">{{$t('To answer')}}</button>
      <div 
        v-b-toggle="'answers-comment-'+comment.comId"
        class="primary-color c-hand d-flex align-items-center"
        v-if="comment.relatedComments"
      >
        <div class="d-flex align-items-center when-closed">
          <div>{{$t('Display answers', {nb:comment.relatedComments})}}
            <i v-if="editRight">{{$t('(nb valid comment answers)',{nb: comment.relatedValidComments})}}</i>
          </div>
          <span class="saooti-arrow_down saooti-arrow_down-margin"></span>
        </div>
        <div class="d-flex align-items-center when-opened">
          <div>{{$t('Hide answers')}}</div>
          <span class="saooti-arrow_down saooti-arrow_down-margin arrow-transform"></span>
        </div>
      </div>
      <EditCommentBox 
      ref="editBox"
      v-if="editRight" 
      :comment="comment" 
      @deleteComment="deleteComment" 
      @updateComment="updateComment" 
      @editComment="editComment" />
		</div>
    <b-collapse :id="'answers-comment-'+comment.comId" class="ml-5" v-model="collapseVisible">
      <CommentInput
      :focus="focus"
      :podcast="podcast"
      :knownIdentity.sync="knownIdentity"
      :comId="comment.comId"
      @newComment="newComment"/>
      <CommentList 
      v-if="comment.relatedComments && collapseVisible" 
      @updateStatus='updateStatus'
      :podcast="podcast"
      ref="commentList" 
      :comId="comment.comId" />
    </b-collapse>
  </div>
</template>

<style lang="scss">
.comment-item-container{
  .icon-certified{
    height: 15px;
    margin-right: 0.5rem;
  }
  .btn-answer{
    padding: 0.1rem 0.75rem;
  }
  .collapsed > .when-opened,
  :not(.collapsed) > .when-closed {
      display: none !important;
  }
}

</style>

<script>
import CommentInput from './CommentInput.vue';
import CommentList from "./CommentList.vue"
import EditCommentBox from "@/components/display/edit/EditCommentBox.vue";
import {state} from "../../../store/paramStore.js";
const moment = require('moment');
export default {
  name: 'CommentItem',

  props:  ["comment", "podcast"],

  components:{
    CommentList,
    EditCommentBox,
    CommentInput
  },


  data() {
    return {
      summary: true,
      collapseVisible: false,
      focus:false,
      isEditing:false,
      temporaryContent: "",
      temporaryName: "",
    };
  },

  computed: {
		date() {
      if(this.comment.date){
        return moment(this.comment.date).format("D MMMM YYYY HH[h]mm");
      }else{
        return ""
      }
    },
    limitContent(){
      if(!this.comment.content) return '';
      if(this.comment.content.length <= 300) return this.comment.content;
      return this.comment.content.substring(0, 300 )+ '...';
    },
    readMore(){
      if(this.summary){
        return this.$t('Read more');
      }else{
        return this.$t('Read less');
      }
    },
    contentDisplay(){
      if(this.summary){
        return this.limitContent;
      }else{
        return this.comment.content;
      }
    },
    organisationId(){
      return state.generalParameters.organisationId;
    },

    authenticated(){
      return state.generalParameters.authenticated;
    },

    editRight() {
      if (this.authenticated) {
        if (this.organisationId === this.podcast.organisation.id && this.$store.state.authentication.role.includes("COMMENTS_MODERATION")) {
          return true;
        }
        if (state.generalParameters.isAdmin) {
          return true;
        }
      }
      return false;
    },
    knownIdentity: {
      get() {
        return this.$store.state.comments.knownIdentity
      },
      set(value) {
        this.$store.commit('setCommentIdentity', value);
      },
    },
  },


  methods: {
    answerComment(){
      this.collapseVisible = true;
      this.focus = !this.focus;
    },
    deleteComment(){
      this.$emit('deleteComment');
    },
    updateComment(data){
      this.isEditing = false;
      this.$emit('updateComment', data);
    },
    newComment(comment){
      let updatedComment = this.comment;
      updatedComment.relatedComments += 1;
      this.$emit('update:comment', updatedComment);
      this.$refs.commentList.addNewComment(comment);
    },
    editComment(){
      this.temporaryContent = this.comment.content;
      this.temporaryName = this.comment.name;
      this.isEditing=true;
    },
    validEdit(){
      let comment = this.comment;
      comment.content = this.temporaryContent;
      comment.name = this.temporaryName;
      this.$refs.editBox.updateComment(comment);
    },
    updateStatus(data){
      let updatedComment = this.comment;
      if(data === "Valid"){
        updatedComment.relatedValidComments += 1;
      }else{
        updatedComment.relatedValidComments -= 1;
      }
      this.$emit('update:comment', updatedComment);
    }
  },

  watch: {
  },
};
</script>