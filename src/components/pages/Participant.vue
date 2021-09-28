<template>
  <div>
    <div class="page-box intervenant-page" v-if="loaded && !error">
      <h1 v-if="undefined === titlePage ||!lightStyle">{{ $t('Animator') }}</h1>
      <h1 v-else>{{ titlePage }}</h1>
      <div
        class="d-flex w-100 flex-column align-items-center justify-content-center"
      >
        <div
          class="img-box-circle mb-3"
          :style="{
            'background-image': 'url(\'' + participant.imageUrl + '\')',
          }"
        ></div>
        <h2 class="text-capitalize">{{ name }}</h2>
        <div
          class="h6 participant-desc html-wysiwyg-content"
          v-html="urlify(description)"
        ></div>
        <div class="d-flex justify-content-center" v-if="isRssButton">
          <a
            class="btn btn-bigRound"
            :title="$t('Subscribe to this participant')"
            :aria-label="$t('Subscribe to this participant')"
            :href="rssUrl"
            rel="noopener"
            target="_blank"
          >
            <div class="saooti-rss-bounty"></div>
          </a>
        </div>
        <div class="d-flex">
          <EditBox
            :participant="participant"
            v-if="editRight && isEditBox"
            @participantUpdate="updateParticipant"
            class="flex-grow-1"
          ></EditBox>
          <ShareButtons
            :participantId="participantId"
            v-if="isShareButtons"
          ></ShareButtons>
        </div>
      </div>
      <PodcastFilterList
        :participantId="participantId"
        :name="name"
        :categoryFilter="true"
        :reload="reload"
        v-if="!lightStyle"
      />
      <PodcastList
        :first="0"
        :size="15"
        :participantId="participantId"
        :reload="reload"
        v-else
      />
    </div>
    <div class="d-flex justify-content-center" v-if="!loaded">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading content ...') }}</h3>
    </div>
    <div class="text-center" v-if="error">
      <h3>{{ $t("Animator doesn't exist") }}</h3>
    </div>
  </div>
</template>

<style lang="scss">
@media (min-width: 950px) {
  .participant-desc {
    max-width: 50%;
    line-height: 1.5em;
  }
}
</style>

<script lang="ts">
// @ is an alias to /src
const octopusApi = require('@saooti/octopus-api');
import { state } from '../../store/paramStore';
import { displayMethods } from '../mixins/functions';
import { Participant } from '@/store/class/participant';

export default {
  components: {
    ShareButtons: () => import('../display/sharing/ShareButtons.vue'),
    PodcastFilterList: () => import('../display/podcasts/PodcastFilterList.vue'),
    EditBox: () => import('@/components/display/edit/EditBox.vue'),
    PodcastList: () => import('../display/podcasts/PodcastList.vue'),
  },
  mixins: [displayMethods],
  props: {
    participantId: { default: undefined as number|undefined},
  },
  emits: ['participantTitle'],
  data() {
    return {
      loaded: false as boolean,
      participant: undefined as Participant|undefined,
      error: false as boolean,
      reload: false as boolean,
    };
  },
  mounted() {
    this.getParticipantDetails();
  },
  computed: {
    organisationId(): string {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    isEditBox(): boolean {
      return state.podcastPage.EditBox;
    },
    isShareButtons(): boolean {
      return state.podcastPage.ShareButtons;
    },
    lightStyle(): boolean {
      return state.intervenantPage.lightStyle;
    },
    isRssButton(): boolean {
      return state.intervenantPage.rssButton;
    },
    titlePage(): string|undefined {
      return state.intervenantPage.titlePage;
    },
    rssUrl(): string {
      return (
        state.generalParameters.ApiUri + 'rss/participant/' + this.participantId
      );
    },
    description(): string {
      return this.participant!.description || '';
    },
    name(): string {
      return (
        (this.participant!.firstName || '') +
        ' ' +
        (this.participant!.lastName || '')
      ).trim();
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
    async getParticipantDetails(): Promise<void> {
      this.loaded = false;
      try {
        const data = await octopusApi.fetchParticipant(this.participantId);
        this.participant = data;
        this.$emit('participantTitle', this.name);
        this.loaded = true;
      } catch {
        this.error = true;
        this.loaded = true;
      }
    },
    updateParticipant(participant: Participant): void {
      this.participant = participant;
      this.$emit('participantTitle', this.name);
    },
  },
  watch: {
    participant(): void {
      this.reload = !this.reload;
    },
  },
};
</script>
