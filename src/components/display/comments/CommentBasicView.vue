<template>
  <div>
    <div class="d-flex small-text">
      <b
        v-if="recordingInLive && ('Live' === comment.phase || 'Prelive' === comment.phase)"
        class="recording-bg me-1 text-light p-1"
      >{{ $t('Live') }}</b>
      <b
        :id="'popover-comment' + comment.comId"
        tabindex="-1"
        :class="editRight || isValid? '':'text-danger'"
        class="me-2"
      >{{
        comment.name
      }}</b>
      <Popover
        :disable="editRight || isValid"
        :target="'popover-comment' + comment.comId"
      >
        {{ $t('Comment waiting') }}
      </Popover>
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
    <!-- eslint-disable vue/no-v-html -->
    <div v-html="urlify(contentDisplay)" />
    <!-- eslint-enable -->
    <a
      v-if="comment.content.length > 300"
      class="c-hand font-italic"
      @click="summary = !summary"
    >{{ readMore }}</a>
  </div>
</template>

<script lang="ts">
import { displayMethods, selenium } from '../../mixins/functions';
import { CommentPodcast } from '@/store/class/general/comment';
import moment from 'moment';
import Popover from '../../misc/Popover.vue';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'CommentBasicView',

  components: {
    Popover
  },

  mixins:[displayMethods, selenium],

  props: {
    comment: { default: ()=>({}), type: Object as ()=>CommentPodcast },
    editRight: { default: false, type: Boolean},
    recordingInLive: { default: false, type: Boolean},
  },

  data() {
    return {
      summary: true as boolean,
    };
  },
  computed: {
    isValid(): boolean{
      return 'Valid'=== this.comment.status;
    },
    date(): string {
      if (this.comment.date)
        return moment(this.comment.date).format('D MMMM YYYY HH[h]mm');
      return '';
    },
    readMore(): string {
      if (this.summary) return this.$t('Read more').toString();
      return this.$t('Read less').toString();
    },
    contentDisplay(): string {
      if (!this.summary){return this.comment.content;}
      if (!this.comment.content) return '';
      if (this.comment.content.length <= 300) return this.comment.content;
      return this.comment.content.substring(0, 300) + '...';
    },
  },
})
</script>