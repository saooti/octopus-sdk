<template>
  <div
    v-if="0 !== comments.length && !isPodcastmaker"
    class="timeline-button"
    @click="$emit('update:showTimeline', !showTimeline)"
  >
    <div
      class="saooti-arrow_down saooti-arrow_down-margin"
      :class="showTimeline ? '' : 'arrow-transform'"
    />
    <div>Timeline</div>
  </div>
  <div
    v-if="isClock"
    class="d-flex text-light align-items-center hide-phone"
  >
    <div class="saooti-clock-stud m-2" />
    <div>{{ actualTime }}</div>
  </div>
</template>

<script lang="ts">
import moment from 'moment';
import { state } from '../../store/paramStore';
import { defineComponent } from 'vue';
import { CommentPodcast } from '@/store/class/comment';
export default defineComponent({
  name: 'PlayerClockAndTimeline',

  props: {
    showTimeline: { default: false, type: Boolean},
    comments: { default: ()=>[], type: Array as ()=>Array<CommentPodcast>},
  },
  emits:['update:showTimeline'],

  data() {
    return {
      actualTime: '' as string,
    };
  },

  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    isClock(): boolean {
      return state.player.clock;
    },

  },

  mounted() {
    if (this.isClock) {
      setInterval(() => {
        this.actualTime = moment(new Date()).format('HH:mm:ss');
      }, 1000);
    }
  },

})
</script>
<style lang="scss">
@import '../../sass/_variables.scss';
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
</style>