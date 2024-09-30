<template>
  <div class="d-flex flex-column align-items-center bg-warning p-3 mb-3">
    <div>{{ $t("This live will start") }}</div>
    <div v-if="countdownTimer">
      {{
        $t("In days hours minutes seconds", {
          days: pad(days),
          hours: pad(hours),
          minutes: pad(minutes),
          seconds: pad(remainingSeconds),
        })
      }}
    </div>
    <div v-else>
      {{ $t("In a moment") }}
    </div>
  </div>
</template>

<script lang="ts">
import countdown from "../../mixins/podcast/countdown";
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    timeRemaining: { default: undefined, type: Number },
  },
  mixins:[countdown]
});
</script>
