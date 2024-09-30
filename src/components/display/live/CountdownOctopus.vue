<template>
  <div class="cute-octopus">
    <div class="leg-1" />
    <div class="head-shape" />
    <div class="octopus-head">
      <div class="eyes" />
      <div class="blush" />
      <div class="mouth" />
    </div>
    <div class="thought">
      {{ $t("This live will start") }}
      <span class="text-lowercase">
        <template v-if="countdownTimer">
          {{
            $t("In days hours minutes seconds", {
              days: pad(days),
              hours: pad(hours),
              minutes: pad(minutes),
              seconds: pad(remainingSeconds),
            })
          }}
        </template>
        <template v-else>
          {{ $t("In a moment") }}
        </template>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import countdown from "../../mixins/podcast/countdown";
import { defineComponent } from "vue";

export default defineComponent({
  name: "CountdownOctopus",
  props: {
    timeRemaining: { default: undefined, type: Number },
  },
  mixins:[countdown],
  data() {
    return {
      seconds: 0 as number,
      countdownTimer: undefined as ReturnType<typeof setTimeout> | undefined,
      days: 0 as number,
      hours: 0 as number,
      minutes: 0 as number,
      remainingSeconds: 0 as number,
    };
  },

});
</script>
<style lang="scss">
@import "@scss/_variables.scss";
$octopus-position: 120px;
.octopus-app .cute-octopus{
  position: relative;
  width: 230px;
  height: 300px;
  margin: auto;
  filter: drop-shadow(3px 0 5px #1f1d1d);

  .head-shape {
    position: absolute;
    top: $octopus-position;
    left: 0;
    height: 117px;
    width: 158px;
    background: $octopus-primary-color;
    border-radius: 50% 50% 20% 20%;
  }
  .eyes,
  .eyes::after {
    position: absolute;
    top: calc(42px + $octopus-position);
    left: 46px;
    width: 17.5px;
    height: 17.5px;
    background: #1f1d1d;
    border-radius: 50%;
    animation: blinking 3s ease-in-out infinite alternate;
  }
  .eyes::after {
    content: "";
    top: 0;
    left: 55px;
  }
  .blush {
    position: absolute;
    top: calc(48px + $octopus-position);
    left: 13px;
    width: 27px;
    height: 27px;
    background: #7addab;
    border-radius: 50%;
    box-shadow: 107x 0 0 0 #7addab;
  }
  .mouth {
    position: absolute;
    top: calc(48px + $octopus-position);
    left: 69px;
    width: 27px;
    height: 27px;
    background: transparent;
    border-radius: 50%;
    box-shadow: 0 7px 0 #1f1d1d;
    animation: mouth-open 2s ease-in-out infinite alternate;
  }
  .leg-1,
  .leg-1::before,
  .leg-1::after {
    position: absolute;
    top: calc(48px + $octopus-position);
    left: 0;
    height: 103px;
    width: 35px;
    background: $octopus-primary-color;
    border-radius: 20% 20% 50% 50%;
    animation: move-left-small 1.5s ease-in-out infinite alternate;
    transform: rotate(20deg);
  }
  .leg-1::after {
    content: "";
    top: -13px;
    left: 42px;
  }
  .leg-1::before {
    animation: move-left 1.5s ease-in-out infinite alternate;
    content: "";
    top: -35px;
    left: 117px;
    box-shadow: -42px 0 0 0 $octopus-primary-color;
    transform: rotate(-35deg);
  }
  @keyframes move-left {
    to {
      transform: translateY(27.3px);
    }
  }
  @keyframes move-left-small {
    to {
      transform: translateY(13px);
    }
  }
  @keyframes blinking {
    0%,
    50%,
    80% {
      background: linear-gradient(#1f1d1d 100%, transparent 100%);
    }
    60%,
    100% {
      background: linear-gradient(
        transparent 23%,
        #1f1d1d 23%,
        transparent 30%
      );
    }
  }

  @keyframes mouth-open {
    to {
      box-shadow: -3.5px 13px 0 0 #1f1d1d;
    }
  }
  .thought {
    z-index: 1;
    text-align: center;
    background-color: #fff;
    padding: 20px;
    border-radius: 30px;
    width: 220px;
    position: absolute;
    font-size: 14px;
  }
  .thought:before,
  .thought:after {
    content: "";
    background-color: #fff;
    border-radius: 50%;
    display: block;
    position: absolute;
    z-index: -1;
  }
  .thought:before {
    width: 44px;
    height: 44px;
    top: -12px;
    left: 28px;
    box-shadow: -50px 30px 0 -12px #fff;
  }
  .thought:after {
    bottom: -10px;
    right: 26px;
    width: 30px;
    height: 30px;
    box-shadow:
      40px -34px 0 0 #fff,
      -28px -6px 0 -2px #fff,
      -24px 17px 0 -6px #fff,
      -5px 25px 0 -10px #fff;
  }
}
</style>

