<template>
  <div class="page-box">
    <div
      v-if="loaded && !error"
    >
      <h1>
        <template v-if="undefined === titlePage ||!lightStyle">
          {{ $t('Animator') }}
        </template>
        <template v-else>
          {{ titlePage }}
        </template>
      </h1>
      <div
        class="d-flex flex-column align-items-center"
      >
        <div
          class="img-box-circle mb-3"
          :style="{
            'background-image': 'url(\'' + participant.imageUrl + '\')',
          }"
        />
        <h2 class="text-capitalize">
          {{ name }}
        </h2>
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="participant-desc html-wysiwyg-content"
          v-html="urlify(description)"
        />
        <!-- eslint-enable -->
        <div
          v-if="isRssButton"
          class="d-flex justify-content-center"
        >
          <a
            class="btn btn-bigRound"
            :title="$t('Subscribe to this participant')"
            :aria-label="$t('Subscribe to this participant')"
            :href="rssUrl"
            rel="noopener"
            target="_blank"
          >
            <div class="saooti-rss-bounty" />
          </a>
        </div>
        <div class="d-flex">
          <EditBox
            v-if="editRight && isEditBox"
            :participant="participant"
            class="flex-grow-1"
            @participantUpdate="updateParticipant"
          />
          <ShareButtons
            v-if="isShareButtons"
            :participant-id="participantId"
          />
        </div>
      </div>
      <PodcastFilterList
        v-if="!lightStyle"
        :participant-id="participantId"
        :name="name"
        :category-filter="true"
        :reload="reload"
      />
      <PodcastList
        v-else
        :first="0"
        :size="15"
        :participant-id="participantId"
        :reload="reload"
      />
    </div>
    <ClassicLoading
      :loading-text="!loaded?$t('Loading content ...'):undefined"
      :error-text="error?$t(`Animator doesn't exist`):undefined"
    />
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import { state } from '../../store/paramStore';
import { displayMethods } from '../mixins/functions';
import { Participant } from '@/store/class/general/participant';
import ClassicLoading from '../form/ClassicLoading.vue';
import { defineComponent, defineAsyncComponent } from 'vue';
const ShareButtons = defineAsyncComponent(() => import('../display/sharing/ShareButtons.vue'));
const PodcastFilterList = defineAsyncComponent(() => import('../display/podcasts/PodcastFilterList.vue'));
const EditBox = defineAsyncComponent(() => import('@/components/display/edit/EditBox.vue'));
const PodcastList = defineAsyncComponent(() => import('../display/podcasts/PodcastList.vue'));
export default defineComponent({
  components: {
    ShareButtons,
    PodcastFilterList,
    EditBox,
    PodcastList,
    ClassicLoading
  },
  mixins: [displayMethods],
  props: {
    participantId: { default: undefined, type: Number},
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
  computed: {
    organisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
    },
    isEditBox(): boolean {
      return (state.podcastPage.EditBox as boolean);
    },
    isShareButtons(): boolean {
      return (state.podcastPage.ShareButtons as boolean);
    },
    lightStyle(): boolean {
      return (state.intervenantPage.lightStyle as boolean);
    },
    isRssButton(): boolean {
      return (state.intervenantPage.rssButton as boolean);
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
      if(!this.participant){return '';}
      return this.participant.description || '';
    },
    name(): string {
      if(!this.participant){return '';}
      return (
        (this.participant.firstName || '') +
        ' ' +
        (this.participant.lastName || '')
      ).trim();
    },
    editRight(): boolean {
      if(!this.participant || !this.participant.orga ){return false;}
      if (
        (this.authenticated &&
          this.organisationId === this.participant.orga.id) ||
        state.generalParameters.isAdmin
      ){
        return true;
      }
      return false;
    },
  },
  watch: {
    participant: {
      deep: true,
      handler(){
      this.reload = !this.reload;
      }
    },
  },
  mounted() {
    this.getParticipantDetails();
  },
  methods: {
    async getParticipantDetails(): Promise<void> {
      this.loaded = false;
      try {
        const data = await octopusApi.fetchParticipant(this.participantId ? this.participantId.toString(): "");
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
})
</script>

<style lang="scss">
@media (min-width: 950px) {
  .participant-desc {
    max-width: 50%;
    line-height: 1.5em;
  }
}
</style>
