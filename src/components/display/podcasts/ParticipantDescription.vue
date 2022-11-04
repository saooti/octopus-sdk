<template>
  <div
    v-if="participants.length"
    class="comma"
  >
    {{ title }}
    <span
      :id="idPopover"
      role="button"
      tabindex="0"
      class="saooti-help m-0"
      :title="title"
    />
    <span class="mx-1">:</span>
    <Popover
      :title="$t('Animated by')"
      :target="idPopover"
    >
      <div 
        v-for="participant in participants"
        :key="'desc-'+participant.participantId"
        class="d-flex flex-column align-items-center"
      >
        <strong><em>{{ getName(participant) }}</em></strong>
        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="participant.description"
          class="participant-desc html-wysiwyg-content"
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
      return this.isGuest ? "popover-guests-help" : "popover-animators-help";
    },
    title(): string{
      return this.isGuest ? this.$t('Guests') : this.$t('Animated by');
    }
  },
  methods: {
    getName(person: Participant): string {
      return (`${person.firstName??''} ${person.lastName??''}`).trim();
    },
  },
})
</script>