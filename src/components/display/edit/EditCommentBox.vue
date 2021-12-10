<template>
  <div class="d-flex">
    <button
      class="btn btn-circle primary-color me-1"
      aria-label="edit"
      @click="editComment"
    >
      <span class="saooti-edit-bounty" />
    </button>
    <button
      v-if="'Pending' === comment.status || 'Invalid' === comment.status"
      class="btn btn-circle primary-color me-1"
      aria-label="valid"
      @click="validComment"
    >
      <span class="saooti-valid-stud" />
    </button>
    <button
      v-if="'Pending' === comment.status || 'Valid' === comment.status"
      class="btn btn-circle primary-color me-1"
      aria-label="invalid"
      @click="invalidComment"
    >
      <span class="saooti-cross" />
    </button>
    <button
      class="btn btn-circle primary-color me-1"
      aria-label="delete"
      @click="deleteComment"
    >
      <span class="saooti-bin" />
    </button>
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