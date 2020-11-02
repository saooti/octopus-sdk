<template>
  <div class="d-flex flex-column comment-input-container">
    <b class="small-Text mt-1" v-if="knownIdentity">{{knownIdentity}}</b>
    <b-form-textarea
			ref="textarea"
      v-model="newComment"
      :placeholder="placeholder"
      max-rows="10"
      @focus="textareaFocus = true"
      @blur="textareaFocus = false"
    ></b-form-textarea>
    <div class="d-flex justify-content-end mt-1" v-if="textareaFocus">
      <button class="btn">{{$t('Cancel')}}</button>
      <button class="btn btn-primary" @mousedown="requestToSend">{{placeholder}}</button>
    </div>
    <AddCommentModal
      v-if="checkIdentityModal"
      @validate="postComment"
      @close="checkIdentityModal=false"
    />
    <MessageModal
      v-if="postError"
      @close="postError=false"
      @validate="postError=false"
      :validatetext="$t('Close')"
      :title="$t('Error')"
      :message="$t('Error occurs while post your comment...')"
    />
  </div>
</template>

<style lang="scss">
@import '../../../sass/_variables.scss';
.comment-input-container{
  textarea::placeholder {
    color: $octopus-primary-color;  
  }
  textarea:focus::placeholder{
    color: black; 
  }
  textarea{
    border-top: 0;
    border-right: 0;
    border-left: 0;
    border-bottom: 0.1rem solid black !important;
    overflow: hidden !important;
    box-shadow: unset !important;
    background: transparent !important;
    height: 40px;
  }
}

</style>

<script>
import AddCommentModal from './AddCommentModal.vue';
import MessageModal from '../../misc/modal/MessageModal.vue';
import octopusApi from "@saooti/octopus-api";
import { cookies } from '../../mixins/functions'
import {state} from "../../../store/paramStore.js";

export default {
  name: 'CommentInput',

  props:  {
    podcast: {default:undefined},
		knownIdentity:{default: null},
		focus:{default:false},
		comId:{default:undefined},
	},
	
	mixins: [cookies],

  components: {
    AddCommentModal,
    MessageModal
  },

  data() {
    return {
      newComment:"",
      textareaFocus: false,
      checkIdentityModal: false,
      postError: false,
    };
  },

  computed:{
    placeholder(){
      if(this.comId){
        return this.$t('Answer a comment');
      }else{
        return this.$t('Write a comment');
      }
    },
    organisationId(){
      return state.generalParameters.organisationId;
    },
    authenticated(){
      return state.generalParameters.authenticated;
    },
    isCertified() {
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
    userId(){
      if(this.authenticated){
        return this.$store.state.profile.userId;
      }
      return undefined;
    }
  },


  methods: {
    requestToSend(){
      if(this.knownIdentity){
        this.postComment();
      }else{
        this.checkIdentityModal = true;
      }
    },
    async postComment(name){
      if(name){
				this.setCookie('comment-octopus-name', name);
				this.$emit('update:knownIdentity', name);
			}
			let timeline = 0;
			if(this.$store.state.player.podcast && this.$store.state.player.podcast.podcastId === this.podcast.podcastId){
				timeline = Math.round(this.$store.state.player.elapsed * this.$store.state.player.total);
			}
      let comment = {
        content: this.newComment,
        name: this.knownIdentity,
        podcastId: this.podcast.podcastId,
        timeline: timeline,
				organisationId: this.podcast.organisation.id,
        commentIdReferer: this.comId,
        certified: this.isCertified,
        userId: this.userId,
      }
      if(this.isCertified){
        comment.status = "Valid";
      }
      try {
        let data = await octopusApi.postComment(comment);
        this.$emit('newComment', data);
        this.newComment = "";
        this.checkIdentityModal = false;
      } catch (error) {
        this.checkIdentityModal = false;
        this.postError = true;
      }
    }
  },

  watch: {
    textareaFocus(){
      this.newComment = this.newComment.trim();
		},
		focus(){
			this.$refs.textarea.focus();
		}
  },
};
</script>