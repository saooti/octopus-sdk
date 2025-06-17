<template>
  <div v-if="participants.length" class="comma">
    {{ title }}
    <span class="mx-1">:</span>
    <router-link
      v-for="participant in participants"
      :key="participant.participantId"
      :title="t('Participant name page', { name: getName(participant) })"
      :to="{
        name: 'participant',
        params: { participantId: participant.participantId },
      }"
    >
      {{ getName(participant) }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { Participant } from "@/stores/class/general/participant";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  participants: {
    default: () => [],
    type: Array as () => Array<Participant>,
  },
  isGuest: { default: false, type: Boolean },
})

//Composables
const { t } = useI18n();

//Computed
const title = computed(() => props.isGuest ? t("Guests") : t("Animated by"));


//Methods
function getName(person: Participant): string {
  return `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
}
</script>
<style lang="scss">
.octopus-app{
  /** Comma list style */
  .comma {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin: 0.5rem 0;

    > a{
      text-transform: capitalize;
    }

    > a, .comma-element {
      &::after {
        content: ", ";
        margin-right: 0.2rem;
      }

      &:last-child {
        &::after {
          content: "";
        }
      }
    }
  }
}
</style>
