<template>
  <div
    class="octopus-progress c-hand-auto mt-1"
    :class="isAmbiance?'ambiance-progress':''"
  >
    <div
      class="octopus-progress-bar"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="'width: ' + percentProgress + '%'"
    />
  </div>
</template>

<script lang="ts">
import { usePlayerStore } from '@/stores/PlayerStore';
import { mapState, mapActions } from 'pinia';
import dayjs from 'dayjs';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'RadioProgressBar',

  components: {
  },
  emits: ['updateNotListenTime'],
  data() {
    return {
      percentInterval: undefined as ReturnType<typeof setTimeout>|undefined,
    };
  },
  
  computed: {
    ...mapState(usePlayerStore, ['playerRadio', 'playerElapsed']),
    isAmbiance(): boolean{
      return !this.playerRadio?.podcast?.podcastId
    },
    percentProgress(): number{
      if(!this.playerElapsed){return 0;}
      return this.playerElapsed * 100;
    },
  },
  mounted(){
    this.handlePercentInterval();
  },
  methods:{
    ...mapActions(usePlayerStore, ['playerUpdateElapsed']),
    handlePercentInterval(/* clear: boolean */): void{
     /*  if(clear){
        clearInterval((this.percentInterval as unknown as number));
        this.percentInterval = undefined;
        return;
      } */
      this.percentInterval = setInterval(() => {
        this.calculatePercent();
      }, 1000);
    },
    calculatePercent(): void{
      if(!this.playerRadio?.metadata){return;}
      const actualMilliSecondsPlayed = dayjs().subtract(18, 'second').diff(dayjs(this.playerRadio.metadata.startDate));
      const percentPlayed = (actualMilliSecondsPlayed) / (this.playerRadio?.metadata.mediaDuration * 1000);
      this.playerUpdateElapsed(percentPlayed, this.playerRadio?.metadata.mediaDuration);
    }
  }

})
</script>
<style lang="scss">
@import '../../../../assets/progressbar.scss';
.octopus-app{
  .ambiance-progress{
    background-color: #d1d1d1;
    .octopus-progress-bar{
      background-color: #747474;
    }
  }
}
</style>