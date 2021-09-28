<template>
  <div class="d-flex">
    <button
      class="btn btn-circle primary-color mr-1"
      aria-label="edit"
      @click="editComment"
    >
      <span class="saooti-edit-bounty"></span>
    </button>
    <button
      class="btn btn-circle primary-color mr-1"
      aria-label="valid"
      v-if="'Pending' === comment.status || 'Invalid' === comment.status"
      @click="validComment"
    >
      <span class="saooti-valid-stud"></span>
    </button>
    <button
      class="btn btn-circle primary-color mr-1"
      aria-label="invalid"
      v-if="'Pending' === comment.status || 'Valid' === comment.status"
      @click="invalidComment"
    >
      <span class="saooti-cross"></span>
    </button>
    <button
      class="btn btn-circle primary-color mr-1"
      aria-label="delete"
      @click="deleteComment"
    >
      <span class="saooti-bin"></span>
    </button>
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
import { CommentPodcast } from '@/store/class/comment';
export default {
  props: {
    comment: { default: undefined as CommentPodcast|undefined },
  },
  emits: ['editComment'],

  methods: {
    editComment() {
      this.$emit('editComment');
    },
    validComment() {
      console.log('valid');
    },
    invalidComment() {
      console.log('invalid');
    },
    deleteComment() {
      console.log('delete');
    },
  },
};
</script>
