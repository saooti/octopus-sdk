<template>
  <div
    v-if="animator"
    class="d-flex align-items-center justify-content-start animators-item"
  >
    <router-link
      :to="{
        name: 'participant',
        params: { participantId: animator.participantId },
      }"
      :title="t('Participant name page', { name: animatorName })"
      class="podcast-item-animator text-truncate"
    >
      {{ animatorName }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { Participant } from "@/stores/class/general/participant";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  animator: { default: undefined, type: Object as () => Participant },
})

//Composables
const { t } = useI18n();

//Computed
const animatorName = computed(() => `${props.animator?.firstName ?? ""} ${ props.animator?.lastName ?? ""}`.trim());

</script>

<style lang="scss">
.octopus-app .podcast-item-animator {
  font-size: 0.55rem;
  font-weight: 300;
  text-transform: capitalize;
}
</style>
