<template>
  <div />
</template>

<script lang="ts">
import { CommentPodcast } from '@/stores/class/general/comment';
import { defineComponent } from 'vue'
export default defineComponent({
  methods:{
    updateComment(comment: CommentPodcast): void{
      console.log(comment);
    }
  }
})
</script>
