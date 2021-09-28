<template>
  <li
    class="participant-item-container"
    v-if="participant"
  >
    <router-link
      :to="{
        name: 'participant',
        params: { participantId: participant.participantId },
        query: { productor: $store.state.filter.organisationId },
      }"
      class="mt-3"
      :aria-label="$t('Participant')"
    >
      <div
        class="img-box-circle"
        :style="{ 'background-image': 'url(\'' + participant.imageUrl + '\')' }"
      ></div>
    </router-link>
    <router-link
      :to="{
        name: 'participant',
        params: { participantId: participant.participantId },
        query: { productor: $store.state.filter.organisationId },
      }"
      class="text-dark mt-3"
    >
      <div class="participant-name">
        <img
          src="/img/caution.png"
          class="icon-caution"
          v-if="!activeParticipant && !isPodcastmaker && editRight"
          :title="$t('Participant have not podcasts')"
        />{{ name }}
      </div>
      <div
        :id="'description-participant-container-' + participant.participantId"
        class="participant-description html-wysiwyg-content"
      >
        <div
          :id="'description-participant-' + participant.participantId"
          v-html="urlify(description)"
        ></div>
      </div>
    </router-link>
    <router-link
      :to="{
        name: 'productor',
        params: { productorId: participant.orga.id },
        query: { productor: $store.state.filter.organisationId },
      }"
      class="text-dark participant-producer"
      v-if="!isPodcastmaker"
    >
      <div class="participant-producer primary-color">
        © {{ participant.orga.name }}
      </div>
    </router-link>
  </li>
</template>

<style lang="scss">
.participant-item-container {
  list-style: none;
  border-radius: 2rem;
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  align-items: center;

  .participant-name {
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
  }

  .participant-description {
    overflow: hidden;
    margin-top: 0.5em;
    word-break: break-word;
    max-height: 4rem;
    position: relative;
    &.after-participant-description:after {
      content: '...';
      position: absolute;
      padding-left: 1rem;
      right: 0;
      bottom: 0;
      width: 100%;
      font-size: 1rem;
      font-weight: bolder;
      text-align: center;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0),
        #f3f3f3 40%
      );
    }
  }

  .participant-producer {
    font-weight: 300;
    font-size: 0.6rem;
  }
  @media (max-width: 960px) {
    margin: 0;
  }
  @media (max-width: 450px) {
    margin: 1rem 0 0;
  }
}
</style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import { Participant } from '@/store/class/participant';
import { state } from '../../../store/paramStore';
import { displayMethods } from '../../mixins/functions';
export default {
  name: 'ParticpantItem',
  mixins: [displayMethods],
  props: {
    participant: { default: undefined as Participant|undefined},
  },

  data() {
    return {
      activeParticipant: true as boolean,
    };
  },

  created() {
    if(!this.editRight)return;
    this.hasPodcast();
  },
  mounted() {
    const participantDesc = document.getElementById(
      'description-participant-' + this.participant.participantId
    );
    const participantDescContainer = document.getElementById(
      'description-participant-container-' + this.participant.participantId
    );
    if (
      null !== participantDesc &&
      participantDesc.clientHeight > participantDescContainer!.clientHeight
    ) {
      participantDescContainer!.classList.add('after-participant-description');
    }
  },
  
  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    description(): string {
      return this.participant.description || '';
    },
    name(): string {
      return (
        (this.participant.firstName || '') +
        ' ' +
        (this.participant.lastName || '')
      ).trim();
    },
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    editRight(): boolean {
      if (
        (this.authenticated &&
          this.organisationId === this.participant!.orga!.id!) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
  },
  methods: {
    async hasPodcast(): Promise<void> {
      const data = await octopusApi.fetchPodcasts({
        participantId: this.participant.participantId,
        first: 0,
        size: 0,
      });
      if (0 === data.count) {
        this.activeParticipant = false;
      }
    },
  },
};
</script>
