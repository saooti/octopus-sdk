<template>
  <div class="d-flex">
    <button
      class="btn btn-comment-edit saooti-edit-bounty"
      title="edit"
      @click="editComment"
    />
    <button
      v-if="'Pending' === comment.status || 'Invalid' === comment.status"
      class="btn btn-comment-edit saooti-valid-stud"
      title="valid"
      @click="validComment"
    />
    <button
      v-if="'Pending' === comment.status || 'Valid' === comment.status"
      class="btn btn-comment-edit saooti-cross"
      title="invalid"
      @click="invalidComment"
    />
    <button
      class="btn btn-comment-edit saooti-bin"
      title="delete"
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