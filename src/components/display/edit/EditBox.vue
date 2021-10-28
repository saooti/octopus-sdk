<template>
  <div />
</template>

<script lang="ts">
import { CommentPodcast } from '@/store/class/comment';
import { defineComponent } from 'vue'
export default defineComponent({
  methods:{
    updateComment(comment: CommentPodcast): void{
      console.log(comment);
      return;
    }
  }
})
</script>

<style lang="scss"></style>
