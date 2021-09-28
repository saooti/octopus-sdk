<template>
   <div class="comma" v-if="participants.length">
      {{ title }}
      <span
        class="saooti-help m-0"
        :id="idPopover"
        :aria-label="$t('Help')"
      ></span>
      <span class="mx-1">:</span>
      <b-popover
        :target="idPopover"
        triggers="hover"
        custom-class="participant-help"
      >
        <div class="text-center font-weight-bold">{{title}}</div>
        <div class="horizontal-separator my-1"></div>
        <div 
        class="d-flex flex-column align-items-center"
        v-for="participant in participants"
        v-bind:key="'desc-'+participant.participantId">
          <b><i>{{getName(participant) }}</i></b>
          <div
            class="h6 participant-desc html-wysiwyg-content"
            v-if="participant.description"
            v-html="participant.description"
          ></div>
          <div class="horizontal-separator my-1"></div>
        </div>
      </b-popover>
      <router-link
        :aria-label="$t('Participant')"
        class="link-info"
        v-for="participant in participants"
        v-bind:key="participant.participantId"
        :to="{
          name: 'participant',
          params: { participantId: participant.participantId },
          query: {
            productor: $store.state.filter.organisationId,
          },
        }"
        >{{ getName(participant) }}</router-link
      >
    </div>
</template>

<style lang="scss">
.participant-help{
  .horizontal-separator {
    border-top: 1px solid #cccccc;
    width: 100%;
  }
} 
</style>

<script lang="ts">
import { Participant } from '@/store/class/participant';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ParticipantDescription',

  props: {
    participants: { default: () => ([]) as Array<Participant>},
    isGuest: { default: false as boolean},
  },

  data() {
    return {
    };
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
    getName(person: any): string {
      const first = person.firstName || '';
      const last = person.lastName || '';
      return (first + ' ' + last).trim();
    },
  },
})
</script>
