<template>
  <div v-if="participants.length" class="comma">
    {{ title }}
    <span class="mx-1">:</span>
    <router-link
      v-for="participant in participants"
      :key="participant.participantId"
      :title="$t('Participant')"
      :to="{
        name: 'participant',
        params: { participantId: participant.participantId },
        query: {
          productor: filterOrgaId,
        },
      }"
    >
      {{ getName(participant) }}
    </router-link>
  </div>
</template>

<script lang="ts">
import { Participant } from "@/stores/class/general/participant";
import { useFilterStore } from "@/stores/FilterStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "ParticipantDescription",

  components: {},

  props: {
    participants: {
      default: () => [],
      type: Array as () => Array<Participant>,
    },
    isGuest: { default: false, type: Boolean },
  },

  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    title(): string {
      return this.isGuest ? this.$t("Guests") : this.$t("Animated by");
    },
  },
  methods: {
    getName(person: Participant): string {
      return `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
    },
  },
});
</script>
