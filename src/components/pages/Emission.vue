<template>
  <div>
    <div class="page-box" v-if="loaded && !error">
      <h1 v-if="!isOuestFrance">{{ $t('Emission') }}</h1>
      <div class="d-flex">
        <div class="d-flex flex-column flex-grow">
          <EditBox
            :emission="emission"
            :rssEmission="rssEmission"
            :ftpEmission="ftpEmission"
            :isReady="isReady"
            v-if="editRight && isEditBox"
          ></EditBox>
          <div class="module-box">
            <h2 v-if="!isOuestFrance">{{ name }}</h2>
            <h1 v-else>{{ name }}</h1>
            <div class="mb-5 mt-3 descriptionText">
              <img
                :src="imageUrl"
                :alt="$t('Emission name image', { name: name })"
                class="img-box shadow-element float-left mr-3 mb-3"
                v-if="!isOuestFrance"
              />
              <p class="html-wysiwyg-content" v-html="urlify(description)"></p>
            </div>
            <ShareButtons
              :emission="emission"
              :bigRound="true"
              v-if="isRssButton"
            ></ShareButtons>
          </div>
          <SubscribeButtons
            :emission="emission"
            v-if="isShareButtons && countLink >= 1"
          ></SubscribeButtons>
        </div>
        <div class="d-flex flex-column share-container">
          <SharePlayer
            :emission="emission"
            :exclusive="exclusive"
            :notExclusive="notExclusive"
            :organisationId="organisationId"
            :isEducation="isEducation"
            v-if="isSharePlayer && (authenticated || notExclusive)"
          ></SharePlayer>
          <ShareButtons
            :emission="emission"
            :notExclusive="notExclusive"
            v-if="isShareButtons"
          ></ShareButtons>
        </div>
      </div>
      <div v-if="editRight">
        <ShareDistribution
          :emissionId="emissionId"
          v-if="isShareDistribution"
        ></ShareDistribution>
      </div>
      <LiveHorizontalList :emissionId="emissionId" v-if="!isPodcastmaker" />
      <PodcastFilterList
        :emissionId="emissionId"
        :categoryFilter="false"
        :editRight="editRight"
        :productorId="emission.orga.id"
        v-if="!isOuestFrance"
        @fetch="fetch"
      />
      <PodcastList
        :first="0"
        :size="15"
        :emissionId="emissionId"
        @fetch="fetch"
        v-else
      />
    </div>
    <div class="d-flex justify-content-center" v-if="!loaded">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading content ...') }}</h3>
    </div>
    <div class="text-center" v-if="error">
      <h3>{{ $t("Emission doesn't exist") }}</h3>
    </div>
  </div>
</template>
<style lang="scss"></style>
<script lang="ts">
// @ is an alias to /src
const octopusApi = require('@saooti/octopus-api');
import { state } from '../../store/paramStore';
import { displayMethods } from '../mixins/functions';
import { Emission } from '@/store/class/emission';

export default displayMethods.extend({
  components: {
    PodcastFilterList: () => import('../display/podcasts/PodcastFilterList.vue'),
    SharePlayer: () => import('../display/sharing/SharePlayer.vue'),
    ShareButtons: () => import('../display/sharing/ShareButtons.vue'),
    ShareDistribution: () => import('../display/sharing/ShareDistribution.vue'),
    EditBox: () => import('@/components/display/edit/EditBox.vue'),
    PodcastList: () => import('../display/podcasts/PodcastList.vue'),
    SubscribeButtons: () => import('../display/sharing/SubscribeButtons.vue'),
    LiveHorizontalList: () => import('../display/live/LiveHorizontalList.vue'),
  },
  props: {
    emissionId: { default: undefined as number|undefined},
    isEducation: { default: false as boolean},
  },

  data() {
    return {
      loaded: false as boolean,
      title: '' as string,
      emission: undefined as Emission | undefined,
      error: false as boolean,
      rssEmission: false as boolean,
      ftpEmission: false as boolean,
      exclusive: false as boolean,
      notExclusive: false as boolean,
      isReady: true as boolean,
      dummyParam: new Date().getTime().toString() as string,
      fetchLive: true as boolean,
    };
  },

  mounted() {
    this.getEmissionDetails();
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
    isSharePlayer(): boolean {
      return state.podcastPage.SharePlayer;
    },
    isShareDistribution(): boolean {
      return state.podcastPage.ShareDistribution;
    },
    isOuestFrance(): boolean {
      return state.emissionPage.ouestFranceStyle;
    },
    isRssButton(): boolean {
      return state.emissionPage.rssButton;
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    rssUrl(): string {
      return state.generalParameters.ApiUri + 'rss/emission/' + this.emissionId;
    },
    name(): string {
      return this.emission ? this.emission.name : '';
    },
    imageUrl(): string {
      return this.emission
        ? this.emission.imageUrl + '?dummy=' + this.dummyParam
        : '';
    },
    description(): string {
      return this.emission ? this.emission.description : '';
    },
    editRight(): boolean {
      if (
        (this.authenticated && this.organisationId === this.emission!.orga.id) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    countLink(): number {
      let count = 0;
      if (this.emission && this.emission.annotations) {
        if (undefined !== this.emission.annotations.amazon) count++;
        if (undefined !== this.emission.annotations.applePodcast) count++;
        if (undefined !== this.emission.annotations.deezer) count++;
        if (undefined !== this.emission.annotations.spotify) count++;
        if (undefined !== this.emission.annotations.tunein) count++;
        if (undefined !== this.emission.annotations.radioline) count++;
        if (undefined !== this.emission.annotations.podcastAddict) count++;
        if (undefined !== this.emission.annotations.playerFm) count++;
        if (undefined !== this.emission.annotations.stitcher) count++;
      }
      return count;
    },
  },
  methods: {
    async getEmissionDetails(): Promise<void> {
      try {
        const data = await octopusApi.fetchEmission(this.emissionId);
        this.emission = data;
        this.$emit('emissionTitle', this.name);
        this.loaded = true;
        if (!this.emission!.annotations) return;
        if (this.emission!.annotations.RSS) {
          this.rssEmission = true;
        }
        if (this.emission!.annotations.FTP) {
          this.ftpEmission = true;
        }
        if (this.emission!.annotations.exclusive) {
          this.exclusive =
            'true' === this.emission!.annotations.exclusive ? true : false;
          this.exclusive =
            this.exclusive && this.organisationId !== this.emission!.orga.id;
        }
        if (this.emission!.annotations.notExclusive) {
          this.notExclusive =
            'true' === this.emission!.annotations.notExclusive ? true : false;
        }
      } catch {
        this.error = true;
        this.loaded = true;
      }
    },
    fetch(/* podcasts */) {
      // Interdire supression si podcast en process
      /* let found = podcasts.find(element => element.processingStatus === 'PLANNED' ||element.processingStatus === 'PROCESSING');
      if(found){
        this.isReady = false;
      } */
    },
  },
  watch: {
    emissionId(): void {
      this.loaded = false;
      this.error = false;
      this.getEmissionDetails();
    },
  },
});
</script>
