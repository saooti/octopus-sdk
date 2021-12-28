<template>
  <div class="d-flex flex-column align-items-center text-danger">
    <h3>{{ $t('This live will start') }}</h3>
    <h3
      v-if="countdownTimer"
    >
      {{
        $t('In days hours minutes seconds', {
          days: pad(days),
          hours: pad(hours),
          minutes: pad(minutes),
          seconds: pad(remainingSeconds),
        })
      }}
    </h3>
    <h3 v-else>
      {{ $t('In a moment') }}
    </h3>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    timeRemaining: { default: undefined, type: Number},
  },
  data() {
    return {
      seconds: 0 as number,
      countdownTimer: undefined as  ReturnType<typeof setTimeout>|undefined,
      days: 0 as number,
      hours: 0 as number,
      minutes: 0 as number,
      remainingSeconds: 0 as number,
    };
  },
  computed: {},
  mounted() {
    if (!this.timeRemaining || this.timeRemaining <= 0) return;
    this.seconds = this.timeRemaining;
    this.countdownTimer = setInterval(() => {
      this.timer();
    }, 1000);
  },
  unmounted() {
    clearInterval((this.countdownTimer as unknown as number));
  },

  methods: {
    timer(): void {
      this.days = Math.floor(this.seconds / 24 / 60 / 60);
      const hoursLeft = Math.floor(this.seconds - this.days * 86400);
      this.hours = Math.floor(hoursLeft / 3600);
      const minutesLeft = Math.floor(hoursLeft - this.hours * 3600);
      this.minutes = Math.floor(minutesLeft / 60);
      this.remainingSeconds = this.seconds % 60;
      if (0 === this.seconds) {
        clearInterval((this.countdownTimer as unknown as number));
        this.countdownTimer = undefined;
      } else {
        this.seconds--;
      }
    },
    pad(n: number): string {
      return n < 10 ? '0' + n : n.toString();
    },
  },
})
</script>

<style lang="scss"></style>