<template>
  <div class="d-flex">
    <button
      class="btn btn-comment-edit saooti-edit-bounty"
      aria-label="edit"
      @click="editComment"
    />
    <button
      v-if="'Pending' === comment.status || 'Invalid' === comment.status"
      class="btn btn-comment-edit saooti-valid-stud"
      aria-label="valid"
      @click="validComment"
    />
    <button
      v-if="'Pending' === comment.status || 'Valid' === comment.status"
      class="btn btn-comment-edit saooti-cross"
      aria-label="invalid"
      @click="invalidComment"
    />
    <button
      class="btn btn-comment-edit saooti-bin"
      aria-label="delete"
      @click="deleteComment"
    />
  </div>
</template>

<script lang="ts">
import { CommentPodcast } from '@/store/class/general/comment';
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    comment: { default: undefined, type: Object as ()=>CommentPodcast},
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
})
</script>
<style lang="scss"></style>