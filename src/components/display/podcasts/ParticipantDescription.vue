<template>
  <div
    v-if="participants.length"
    class="comma"
  >
    {{ title }}
    <span
      :id="idPopover"
      role="button"
      tabindex="-1"
      class="saooti-help m-0"
      :title="title"
    />
    <span class="mx-1">:</span>
    <Popover
      :target="idPopover"
    >
      <div 
        v-for="participant in participants"
        :key="'desc-'+participant.participantId"
        class="d-flex flex-column align-items-center"
      >
        <b><i>{{ getName(participant) }}</i></b>
        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="participant.description"
          class="h6 participant-desc html-wysiwyg-content"
          v-html="participant.description"
        />
        <!-- eslint-enable -->
        <hr>
      </div>
    </Popover>
    <router-link
      v-for="participant in participants"
      :key="participant.participantId"
      :title="$t('Participant')"
      class="fw-bold"
      :to="{
        name: 'participant',
        params: { participantId: participant.participantId },
        query: {
          productor: $store.state.filter.organisationId,
        },
      }"
    >
      {{ getName(participant) }}
    </router-link>
  </div>
</template>

<script lang="ts">
import Popover from '../../misc/Popover.vue';
import { Participant } from '@/store/class/general/participant';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ParticipantDescription',

  components:{
    Popover
  },

  props: {
    participants: { default: () => [], type: Array as ()=> Array<Participant>},
    isGuest: { default: false, type:  Boolean},
  },

  computed:{
    idPopover(): string{
      if(this.isGuest){
        return "popover-guests-help";
      }
      return "popover-animators-help";
    },
    title(): string{
      if(this.isGuest){
        return this.$t('Guests').toString();
      }
      return this.$t('Animated by').toString();
    }
  },
  methods: {
    getName(person: Participant): string {
      const first = person.firstName || '';
      const last = person.lastName || '';
      return (first + ' ' + last).trim();
    },
  },
})
</script>