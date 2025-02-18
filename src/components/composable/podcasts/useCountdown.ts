import {computed, onBeforeUnmount, onMounted, Ref, ref} from 'vue';
export const useCountdown = (timeRemaining: number|undefined)=>{
  const days = ref(0);
  const hours = ref(0);
  const minutes = ref(0);
  const seconds = ref(0);
  const remainingSeconds = ref(0);
  const countdownTimer : Ref<ReturnType<typeof setTimeout> | undefined> = ref(undefined);

  const countdownValues = computed(() => { 
    return {
      days: pad(days.value),
      hours: pad(hours.value),
      minutes: pad(minutes.value),
      seconds: pad(remainingSeconds.value),
    }
  });

  function timer(): void {
    days.value = Math.floor(seconds.value / 24 / 60 / 60);
    const hoursLeft = Math.floor(seconds.value - days.value * 86400);
    hours.value = Math.floor(hoursLeft / 3600);
    const minutesLeft = Math.floor(hoursLeft - hours.value * 3600);
    minutes.value = Math.floor(minutesLeft / 60);
    remainingSeconds.value = seconds.value % 60;
    if (0 === seconds.value) {
      clearInterval(countdownTimer.value as unknown as number);
      countdownTimer.value = undefined;
    } else {
      seconds.value-=1;
    }
  }
  function pad(n: number): string {
    return/*  n < 10 ? "0" + n : */ n.toString();
  }

  onMounted(() => {
    if (!timeRemaining || timeRemaining <= 0) return;
    seconds.value = timeRemaining;
    countdownTimer.value = setInterval(() => {
      timer();
    }, 1000);
  })
  
  onBeforeUnmount(() => {
    clearInterval(countdownTimer.value as unknown as number);
  })

	return {
    countdownValues,
    countdownTimer
	}
}
