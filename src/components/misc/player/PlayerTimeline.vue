<template>
  <div
    v-if="0 !== comments.length && !isPodcastmaker"
    class="timeline-button"
    @click="$emit('update:showTimeline', !showTimeline)"
  >
    <div
      class="saooti-arrow_down"
      :class="showTimeline ? '' : 'arrow-transform'"
    />
    <div>Timeline</div>
  </div>
</template>

<script lang="ts">
import { state } from '../../../store/paramStore';
import { defineComponent } from 'vue';
import { CommentPodcast } from '@/store/class/general/comment';
export default defineComponent({
  name: 'PlayerTimeline',

  props: {
    showTimeline: { default: false, type: Boolean},
    comments: { default: ()=>[], type: Array as ()=>Array<CommentPodcast>},
  },
  emits:['update:showTimeline'],

  computed: {
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
  },

})
</script>
<style lang="scss">
@import '../../../sass/_variables.scss';
.octopus-app{
.player-container {
  .timeline-button {
    background: black;
    padding: 0.1rem;
    border-radius: 50%;
    width: 70px;
    height: 70px;
    font-size: 0.7rem;
    font-weight: bold;
    justify-content: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    color: $octopus-primary-color;
    margin-left: 0.5rem;
    @media (max-width: 960px) {
      display: none;
    }
  }
}
}
</style>