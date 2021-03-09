<template>
  <div class="d-flex flex-column align-items-center text-danger">
    <h3>{{ $t('This live will start') }}</h3>
    <h3 ref="countdown" v-if="countdownTimer">
      {{
        $t('In days hours minutes seconds', {
          days: pad(days),
          hours: pad(hours),
          minutes: pad(minutes),
          seconds: pad(remainingSeconds),
        })
      }}
    </h3>
    <h3 v-else>{{ $t('In a moment') }}</h3>
  </div>
</template>
<style lang="scss"></style>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  components: {},

  mounted() {
    if (!this.timeRemaining || this.timeRemaining <= 0) return;

    this.seconds = this.timeRemaining;
    this.countdownTimer = setInterval(() => {
      this.timer();
    }, 1000);
  },

  props: ['timeRemaining'],

  data() {
    return {
      seconds: undefined as any,
      countdownTimer: undefined as any,
      days: 0,
      hours: 0,
      minutes: 0,
      remainingSeconds: 0,
    };
  },

  computed: {},

  methods: {
    timer() {
      this.days = Math.floor(this.seconds / 24 / 60 / 60);
      var hoursLeft = Math.floor(this.seconds - this.days * 86400);
      this.hours = Math.floor(hoursLeft / 3600);
      var minutesLeft = Math.floor(hoursLeft - this.hours * 3600);
      this.minutes = Math.floor(minutesLeft / 60);
      this.remainingSeconds = this.seconds % 60;

      /* this.$refs.countdown.innerHTML = this.pad(days) + ":" + this.pad(hours) + ":" + this.pad(minutes) + ":" + this.pad(remainingSeconds); */
      if (0 === this.seconds) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = undefined;
      } else {
        this.seconds--;
      }
    },
    pad(n: string|number) {
      return n < 10 ? '0' + n : n;
    },
  },
});
</script>
