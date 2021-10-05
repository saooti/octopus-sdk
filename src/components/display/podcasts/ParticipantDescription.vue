<template>
  <div
    v-if="participants.length"
    class="comma"
  >
    {{ title }}
    <span
      :id="idPopover"
      class="saooti-help m-0 c-hand"
      data-bs-toggle="popover"
      data-bs-trigger="hover focus"
      :aria-label="$t('Help')"
      data-bs-custom-class="participant-help"
    />
    <span class="mx-1">:</span>
    <div
      :id="idPopover+'content'"
      class="d-none"
    >
      <div class="text-center fw-bold">
        {{ title }}
      </div>
      <div class="horizontal-separator my-1" />
      <div 
        v-for="participant in participants"
        :key="'desc-'+participant.participantId"
        class="d-flex flex-column align-items-center"
      >
        <b><i>{{ getName(participant) }}</i></b>
        <div
          v-if="participant.description"
          class="h6 participant-desc html-wysiwyg-content"
          v-html="participant.description"
        />
        <div class="horizontal-separator my-1" />
      </div>
    </div>
    <router-link
      v-for="participant in participants"
      :key="participant.participantId"
      :aria-label="$t('Participant')"
      class="link-info"
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
const bootstrap = require('bootstrap/dist/js/bootstrap.esm.min.js');
import { Participant } from '@/store/class/participant';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ParticipantDescription',

  props: {
    participants: { default: () => [], type: Array as ()=> Array<Participant>},
    isGuest: { default: false, type:  Boolean},
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
  mounted(){
    const contentPopover = document.querySelector('#'+this.idPopover+'content');
    if(contentPopover){
      new bootstrap.Popover(document.querySelector('#'+this.idPopover),{
        trigger: 'hover focus',
        html: true,
        content: (contentPopover as HTMLElement).innerHTML
      });
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

<style lang="scss">
.participant-help{
  .horizontal-separator {
    border-top: 1px solid #cccccc;
    width: 100%;
  }
} 
</style>