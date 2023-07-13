<template>
  <div
    v-if="participant"
    class="participant-item-container"
  >
    <router-link
      :to="{
        name: 'participant',
        params: { participantId: participant.participantId },
        query: { productor: filterOrgaId },
      }"
      class="mt-3 text-dark"
      :title="$t('Participant')"
    >
      <img
        v-lazy="proxyImageUrl(participant.imageUrl, '200')"
        width="200"
        height="200"
        :title="$t('Animator image')"
        :alt="$t('Animator image')"
        class="img-box border"
      >
      <div class="d-flex align-items-center h4 justify-content-center mt-2">
        <span
          v-if="!activeParticipant && !isPodcastmaker && editRight"
          :title="$t('Participant have not podcasts')"
          class="saooti-warning text-danger me-1"
        />
        {{ name }}
      </div>
      <div
        ref="descriptionParticipantContainer"
        class="participant-description html-wysiwyg-content"
      >
        <!-- eslint-disable vue/no-v-html -->
        <div
          ref="descriptionParticipant"
          v-html="urlify(participant.description|| '')"
        />
        <!-- eslint-enable -->
      </div>
    </router-link>
    <router-link
      v-if="!isPodcastmaker"
      :to="{
        name: 'productor',
        params: { productorId: participant.orga.id },
        query: { productor: filterOrgaId },
      }"
      class="participant-producer"
    >
      © {{ participant.orga.name }}
    </router-link>
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import { Participant } from '@/stores/class/general/participant';
import { state } from '../../../stores/ParamSdkStore';
import imageProxy from '../../mixins/imageProxy';
import displayMethods from '../../mixins/displayMethods';
import { orgaComputed } from '../../mixins/orgaComputed';
import { defineComponent } from 'vue'
import { Podcast } from '@/stores/class/general/podcast';
export default defineComponent({
  name: 'ParticpantItem',
  mixins: [displayMethods, orgaComputed, imageProxy],
  props: {
    participant: { default: ()=>({}), type: Object as ()=> Participant},
  },
  data() {
    return {
      activeParticipant: true as boolean,
    };
  },
  computed: {
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    name(): string {
      return (`${this.participant.firstName??''} ${this.participant.lastName??''}`).trim();
    },
    editRight(): boolean {
      if(!this.participant || !this.participant.orga){
        return false;
      }
      return (this.authenticated &&
        this.myOrganisationId === this.participant.orga.id) ||
        true === state.generalParameters.isAdmin
    },
  },

  created() {
    if(!this.editRight)return;
    this.hasPodcast();
  },
  mounted() {
    const participantDesc = (this.$refs.descriptionParticipant as HTMLElement);
    const participantDescContainer = (this.$refs.descriptionParticipantContainer as HTMLElement);
    if (
      null !== participantDesc && null !==participantDescContainer && 
      participantDesc.clientHeight > participantDescContainer.clientHeight
    ) {
      participantDescContainer.classList.add('after-participant-description');
    }
  },
  methods: {
    async hasPodcast(): Promise<void> {
      const data =  await octopusApi.fetchDataWithParams<{count: number;result:Array<Podcast>;sort: string;}>(0, 'podcast/search',{
        participantId: this.participant.participantId,
        first: 0,
        size: 0,
        includeStatus:["READY","PROCESSING"]
      }, true);
      if (0 === data.count) {
        this.activeParticipant = false;
      }
    },
  },
})
</script>
<style lang="scss">
@import '@scss/_variables.scss';
.octopus-app{
.participant-item-container {
  list-style: none;
  border-radius: $octopus-borderradius;
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  align-items: center;
  width: $octopus-item-size;

  .participant-description {
    overflow: hidden;
    margin-top: 0.5em;
    word-break: break-word;
    max-height: 3rem;
    position: relative;
    text-align: center;
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
        white 40%
      );
    }
  }

  .participant-producer {
    font-weight: 300;
    font-size: 0.6rem;
    margin-top: 0.5rem;
  }
  @media (max-width: 960px) {
    margin: 0;
  }
  @media (max-width: 450px) {
    margin: 1rem 0 0;
  }
}
}
</style>