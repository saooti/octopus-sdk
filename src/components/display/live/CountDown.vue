<template>
  <div class="d-flex flex-column align-items-center bg-warning p-3 mb-3">
    <div>{{ t("This live will start") }}</div>
    <div v-if="countdownTimer">
      {{
        t("In days hours minutes seconds",countdownValues)
      }}
    </div>
    <div v-else>
      {{ t("In a moment") }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import {useCountdown} from "../../composable/podcasts/useCountdown";

//Props 
const props = defineProps({
  timeRemaining:{ default: undefined, type: Number },
})

//Composables
const { t } = useI18n();
const { countdownValues, countdownTimer } = useCountdown(props.timeRemaining);
</script>
