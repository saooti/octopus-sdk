<template>
  <div
    class="octopus-progress"
  >
    <div
      v-if="secondaryProgress"
      class="octopus-progress-bar bg-light"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="'width: ' + secondaryProgress + '%'"
    />
    <template v-if="playerMedia">
      <div
        v-if="mediaCueInPercent > 0"
        class="octopus-progress-bar bg-complementary"
        :style="{'width': + mediaCueInPercent + '%'}"
      />
      <div
        v-if="mediaCueOutPercent < 100"
        class="octopus-progress-bar end-0 bg-complementary"
        :style="{'width': + 100- mediaCueOutPercent + '%'}"
      />
    </template>
    <div
      class="octopus-progress-bar bg-primary"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="'width: ' + mainProgress + '%'"
    />
    <template v-if="playerMedia">
      <div
        v-if="mediaCueInPercent > 0"
        class="octopus-progress-bar octopus-progress-bar-duration bg-complementary"
        :style="{'left': + mediaCueInPercent + '%'}"
      />
      <div
        v-if="mediaCueOutPercent < 100"
        class="octopus-progress-bar end-0 octopus-progress-bar-duration bg-complementary"
        :style="{'right': + 100- mediaCueOutPercent + '%'}"
      />
    </template>
    <div
      v-if="alertBar"
      class="octopus-progress-bar octopus-progress-bar-duration bg-danger"
      :style="'left: ' + alertBar + '%'"
    />
    <div
      v-if="isProgressCursor"
      class="progress-bar-cursor"
      :style="'left:' + mainProgress + '%'"
    />
  </div>
</template>

<script lang="ts">
import { usePlayerStore } from '@/stores/PlayerStore';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ProgressBar',
  props: {
    alertBar: { default: undefined, type: Number},
    mainProgress: { default: 0, type: Number},
    secondaryProgress: { default: 0, type: Number},
    isProgressCursor: { default: false, type: Boolean},
  },
  data() {
    return {
      mediaCueInPercent: 0 as number,
      mediaCueOutPercent: 100 as number,
    };
  },
  computed:{
    ...mapState(usePlayerStore, ['playerMedia']),
  },
  watch:{
    playerMedia: {
      deep: true,
      immediate:true,
      handler(){
        if(this.playerMedia){
          this.mediaCueInPercent = this.timeMediaToPercent(this.playerMedia.cueIn??0);
          this.mediaCueOutPercent = this.timeMediaToPercent(this.playerMedia.cueOut??null);
        }
      }
    },
  },
  methods:{
    timeMediaToPercent(value: number|null):number{
      if(null===value || !this.playerMedia){return 100;}
      return (value*100)/(this.playerMedia?.duration??1);
    },
  }
})
</script>

<style lang="scss">
@import '@scss/_variables.scss';
.octopus-app{
  .octopus-progress{
    display: flex;
    overflow: hidden;
    background-color:#e9ecef;
    border-radius: $octopus-borderradius;
    position: relative;
    cursor: pointer;

    .octopus-progress-bar{
      position: absolute;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
      color: white;
      text-align: center;
      white-space: nowrap;
      background-color: $octopus-primary-color;
      transition: width 0.6s ease;
    }
    &,.octopus-progress-bar{
      height: 4px;
      @media (max-width: 960px) {
        height: 8px;
      }
    }
    &.large,&.large .octopus-progress-bar{
      height: 15px;
    }
    &.medium,&.medium .octopus-progress-bar{
      height: 6px;
    }
    .octopus-progress-bar-duration {
      width: 10px;
    }
    .octopus-progress-bar-cursor{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: black;
      align-self: center;
      position: absolute;
    }
    .end-0{
      right: 0;
    }
  }
}
</style>