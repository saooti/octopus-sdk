<template>
  <div class="mt-2">
    <div
      v-if="loading"
      class="d-flex"
    >
      <div class="spinner-border me-3" />
      <div class="mt-2">
        {{ $t('Loading content ...') }}
      </div>
    </div>
    <div v-else>
      <div class="d-flex small-Text">
        <b class="me-2">{{ comment.name }}</b>
        <img
          v-if="comment.certified"
          class="icon-certified"
          src="/img/certified.png"
          :title="$t('Certified account')"
        >
        <div class="me-2">
          {{ date }}
        </div>
      </div>
      <div>{{ contentDisplay }}</div>
      <a
        v-if="comment.content.length > 300"
        class="c-hand font-italic"
        @click="summary = !summary"
      >{{ readMore }}</a>
    </div>
  </div>
</template>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
const moment = require('moment');
import { CommentPodcast } from '@/store/class/comment';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'CommentParentInfo',

  props: {
    comId: { default: undefined, type: Number },
  },

  data() {
    return {
      loading: true as boolean,
      summary: true as boolean,
      comment: undefined as CommentPodcast|undefined,
    };
  },

  
  computed: {
    date(): string {
      if (this.comment!.date)
        return moment(this.comment!.date).format('D MMMM YYYY HH[h]mm');
      return '';
    },
    limitContent(): string {
      if (!this.comment!.content) return '';
      if (this.comment!.content.length <= 300) return this.comment!.content;
      return this.comment!.content.substring(0, 300) + '...';
    },
    readMore(): string {
      if (this.summary) return this.$t('Read more').toString();
      return this.$t('Read less').toString();
    },
    contentDisplay(): string {
      if (this.summary) return this.limitContent;
      return this.comment!.content;
    },
  },

  async created() {
    this.comment = await octopusApi.fetchComment(this.comId);
    this.loading = false;
  },
})
</script>

<style lang="scss"></style>