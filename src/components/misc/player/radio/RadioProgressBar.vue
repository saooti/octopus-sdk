<template>
  <progress
    class="c-hand-auto mt-1"
    min="0"
    max="100"
    :value="percentProgress"
    :aria-label="t('Radio')"
    :class="isAmbiance ? 'ambiance-progress' : ''"
  />
</template>

<script setup lang="ts">
import { usePlayerStore } from "../../../../stores/PlayerStore";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import { computed, onMounted, onUnmounted, ref, Ref } from "vue";

//Data 
const percentInterval: Ref<ReturnType<typeof setTimeout> | undefined> = ref(undefined);

//Composables
const { t } = useI18n();
const playerStore = usePlayerStore();


//Computed
const isAmbiance = computed(() => !playerStore.playerRadio?.podcast?.podcastId);
const percentProgress = computed(() => {
  if (!playerStore.playerElapsed) {
    return 0;
  }
  return playerStore.playerElapsed * 100;
});


onMounted(()=>handlePercentInterval())
onUnmounted(()=>clearInterval(percentInterval.value as unknown as number))


//Methods
function handlePercentInterval(): void {
  percentInterval.value = setInterval(() => {calculatePercent();}, 1000);
}
function calculatePercent(): void {
  if (!playerStore.playerRadio?.metadata) {
    return;
  }
  const actualMilliSecondsPlayed = dayjs()
    .subtract(18, "second")
    .diff(dayjs(playerStore.playerRadio.metadata.startDate));
  const percentPlayed =
    actualMilliSecondsPlayed /
    (playerStore.playerRadio?.metadata.playDuration * 1000);
    playerStore.playerUpdateElapsed(
    percentPlayed,
    playerStore.playerRadio?.metadata.playDuration,
  );
}
</script>
