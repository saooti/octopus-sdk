<template>
  <div>
    <div class="d-flex small-text">
      <strong
        v-if="recordingInLive && ('Live' === comment.phase || 'Prelive' === comment.phase)"
        class="recording-bg me-1 text-light p-1"
      >{{ $t('Live') }}</strong>
      <strong
        :id="'popover-comment' + comment.comId"
        role="button"
        tabindex="-1"
        :class="editRight || isValid? 'c-hand-auto':'text-danger'"
        class="me-2"
      >{{
        comment.name
      }}</strong>
      <Popover
        :disable="editRight || isValid"
        :target="'popover-comment' + comment.comId"
      >
        {{ $t('Comment waiting') }}
      </Popover>
      <span
        v-if="comment.certified"
        class="saooti-certified"
        :data-selenium="'certified-icon-' + seleniumFormat(comment.name)"
        :title="$t('Certified account')"
        :alt="$t('Certified account')"
      />
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
import selenium from '../../mixins/selenium';
import displayMethods from '../../mixins/displayMethods';
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
      return this.comment.date ? moment(this.comment.date).format('D MMMM YYYY HH[h]mm') : '';
    },
    readMore(): string {
      return this.summary ? this.$t('Read more') : this.$t('Read less');
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
