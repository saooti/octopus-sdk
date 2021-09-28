<template>
  <div class="mt-2">
    <div class="d-flex" v-if="loading">
      <div class="spinner-border mr-3"></div>
      <div class="mt-2">{{ $t('Loading content ...') }}</div>
    </div>
    <div v-else>
      <div class="d-flex small-Text">
        <b class="mr-2">{{ comment.name }}</b>
        <img
          class="icon-certified"
          src="/img/certified.png"
          v-if="comment.certified"
          :title="$t('Certified account')"
        />
        <div class="mr-2">{{ date }}</div>
      </div>
      <div>{{ contentDisplay }}</div>
      <a
        class="c-hand font-italic"
        v-if="comment.content.length > 300"
        @click="summary = !summary"
        >{{ readMore }}</a
      >
    </div>
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
const moment = require('moment');
import { CommentPodcast } from '@/store/class/comment';
export default {
  name: 'CommentParentInfo',

  props: {
    comId: { default: undefined as number|undefined },
  },

  data() {
    return {
      loading: true as boolean,
      summary: true as boolean,
      comment: undefined as CommentPodcast|undefined,
    };
  },

  async created() {
    this.comment = await octopusApi.fetchComment(this.comId);
    this.loading = false;
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
};
</script>
