<template>
  <div class="page-box">
    <div
      v-if="loaded && !error"
    >
      <h1 v-if="!pageParameters.lightStyle">
        {{ titleDisplay }}
      </h1>
      <div
        class="d-flex flex-column align-items-center mb-3"
      >
        <img
          v-lazy="proxyImageUrl(participant.imageUrl, '200')"
          width="200"
          height="200"
          :title="$t('Animator image')"
          :alt="$t('Animator image')"
          class="img-box-circle mb-3"
        >
        <h2 class="text-capitalize">
          {{ name }}
        </h2>
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="participant-desc html-wysiwyg-content"
          v-html="urlify(description)"
        />
        <!-- eslint-enable -->
        <div class="d-flex mt-3">
          <EditBox
            v-if="editRight && pageParameters.isEditBox"
            :participant="participant"
            class="flex-grow-1"
            @participantUpdate="updateParticipant"
          />
          <ShareButtons
            v-if="pageParameters.isShareButtons"
            :participant-id="participantId"
            :organisation-id="participant.orga.id"
            :isVertical="false"
          />
        </div>
      </div>
      <PodcastFilterList
        v-if="!pageParameters.lightStyle"
        :participant-id="participantId"
        :name="name"
        :category-filter="true"
        :reload="reload"
        :showCount="true"
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
import displayMethods from '../mixins/displayMethods';
import imageProxy from '../mixins/imageProxy';
import { orgaComputed } from '../mixins/orgaComputed';
import { handle403 } from '../mixins/handle403';
import { Participant } from '@/store/class/general/participant';
import ClassicLoading from '../form/ClassicLoading.vue';
import { defineComponent, defineAsyncComponent } from 'vue';
import { AxiosError } from 'axios';
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
  mixins: [displayMethods, handle403, orgaComputed, imageProxy],
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
    titleDisplay(): string{
      return state.intervenantPage.titlePage??this.$t('Animator');
    },
    pageParameters(){
      return {
        isEditBox : (state.podcastPage.EditBox as boolean),
        isShareButtons: (state.podcastPage.ShareButtons as boolean),
        lightStyle:(state.intervenantPage.lightStyle as boolean),
      };
    },
    rssUrl(): string {
      return `${state.generalParameters.ApiUri}rss/participant/${this.participantId}`;
    },
    description(): string {
      return this.participant?.description ?? '';
    },
    name(): string {
      return (`${this.participant?.firstName??''} ${this.participant?.lastName??''}`).trim();
    },
    editRight(): boolean {
      return (true===this.authenticated &&
          this.myOrganisationId === this.participant?.orga?.id) ||
        true===state.generalParameters.isAdmin
    },
  },
  watch: {
    participant: {
      deep: true,
      handler(){
      this.reload = !this.reload;
      }
    },
    participantId: {
      immediate: true,
      handler() {
        this.getParticipantDetails();
      },
    },
  },
  methods: {
    initError():void{
      this.error = true;
      this.loaded = true;
    },
    async getParticipantDetails(): Promise<void> {
      this.loaded = false;
      try {
        const data = await octopusApi.fetchData<Participant>(0, 'participant/'+this.participantId);
        if("PUBLIC"!==data?.orga?.privacy && this.filterOrga!==data?.orga?.id){
          this.initError();
          return;
        }
        this.updateParticipant(data);
        this.loaded = true;
      } catch(error) {
        this.handle403((error as AxiosError));
        this.initError();
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
.octopus-app{
  @media (min-width: 950px) {
    .participant-desc {
      max-width: 50%;
      line-height: 1.5em;
    }
  }
}
</style>
