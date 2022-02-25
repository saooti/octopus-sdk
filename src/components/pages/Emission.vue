<template>
  <div class="page-box">
    <div
      v-if="loaded && !error"
    >
      <h1 v-if="!isOuestFrance">
        {{ $t('Emission') }}
      </h1>
      <div class="d-flex">
        <div class="d-flex flex-column flex-grow-1">
          <EditBox
            v-if="editRight && isEditBox"
            :emission="emission"
            :rss-emission="rssEmission"
            :ftp-emission="ftpEmission"
            :is-ready="isReady"
            @isUpdated="getEmissionDetails"
          />
          <div class="module-box">
            <h2 v-if="!isOuestFrance">
              {{ name }}
            </h2>
            <h1 v-else>
              {{ name }}
            </h1>
            <div class="mb-5 mt-3 descriptionText">
              <img
                v-if="!isOuestFrance"
                :src="imageUrl"
                :alt="$t('Emission name image', { name: name })"
                class="img-box shadow-element float-start me-3 mb-3"
              >
              <!-- eslint-disable vue/no-v-html -->
              <p
                class="html-wysiwyg-content"
                v-html="urlify(description)"
              />
              <!-- eslint-enable -->
            </div>
            <ShareButtons
              v-if="isRssButton"
              :emission="emission"
              :big-round="true"
            />
          </div>
          <SubscribeButtons
            v-if="isShareButtons && countLink >= 1"
            :emission="emission"
          />
        </div>
        <div class="d-flex flex-column flex-grow-mobile">
          <SharePlayer
            v-if="isSharePlayer && (authenticated || notExclusive)"
            :emission="emission"
            :exclusive="exclusive"
            :not-exclusive="notExclusive"
            :organisation-id="organisationId"
            :is-education="isEducation"
          />
          <ShareButtons
            v-if="isShareButtons"
            :emission="emission"
            :not-exclusive="notExclusive"
          />
        </div>
      </div>
      <div v-if="editRight">
        <ShareDistribution
          v-if="isShareDistribution"
          :emission-id="emissionId"
        />
      </div>
      <template v-if="isDisplayPodcasts">
        <LiveHorizontalList
          v-if="!isPodcastmaker"
          :emission-id="emissionId"
        />
        <PodcastFilterList
          v-if="!isOuestFrance"
          :emission-id="emissionId"
          :category-filter="false"
          :edit-right="editRight"
          :productor-id="emission.orga.id"
          @fetch="fetch"
        />
        <PodcastList
          v-else
          :first="0"
          :size="15"
          :emission-id="emissionId"
          @fetch="fetch"
        />
      </template>
    </div>
    <ClassicLoading
      :loading-text="!loaded?$t('Loading content ...'):undefined"
      :error-text="error?$t(`Emission doesn't exist`):undefined"
    />
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import { state } from '../../store/paramStore';
import { displayMethods } from '../mixins/functions';
import { Emission } from '@/store/class/general/emission';
import ClassicLoading from '../form/ClassicLoading.vue';
import { defineComponent, defineAsyncComponent } from 'vue';
const PodcastFilterList = defineAsyncComponent(() => import('../display/podcasts/PodcastFilterList.vue'));
const SharePlayer = defineAsyncComponent(() => import('../display/sharing/SharePlayer.vue'));
const ShareButtons = defineAsyncComponent(() => import('../display/sharing/ShareButtons.vue'));
const ShareDistribution = defineAsyncComponent(() => import('../display/sharing/ShareDistribution.vue'));
const EditBox = defineAsyncComponent(() => import('@/components/display/edit/EditBox.vue'));
const PodcastList = defineAsyncComponent(() => import('../display/podcasts/PodcastList.vue'));
const SubscribeButtons = defineAsyncComponent(() => import('../display/sharing/SubscribeButtons.vue'));
const LiveHorizontalList = defineAsyncComponent(() => import('../display/live/LiveHorizontalList.vue'));
export default defineComponent({
  components: {
    PodcastFilterList,
    SharePlayer,
    ShareButtons,
    ShareDistribution,
    EditBox,
    PodcastList,
    SubscribeButtons,
    LiveHorizontalList,
    ClassicLoading
  },
  mixins: [displayMethods],
  props: {
    emissionId: { default: undefined, type: Number},
    isEducation: { default: false, type: Boolean},
  },
  emits: ['emissionTitle'],

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
    isSharePlayer(): boolean {
      return (state.podcastPage.SharePlayer as boolean);
    },
    isShareDistribution(): boolean {
      return (state.podcastPage.ShareDistribution as boolean);
    },
    isOuestFrance(): boolean {
      return (state.emissionPage.ouestFranceStyle as boolean);
    },
    isRssButton(): boolean {
      return (state.emissionPage.rssButton as boolean);
    },
    isDisplayPodcasts(): boolean {
      return (state.emissionPage.isDisplayPodcasts as boolean);
    },
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
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
        (this.authenticated && this.emission && this.organisationId === this.emission.orga.id) ||
        state.generalParameters.isAdmin
      ){
        return true;
      }
      return false;
    },
    countLink(): number {
      let count = 0;
      if (this.emission && this.emission.annotations) {
        if (undefined !== this.emission.annotations.amazon) count++;
        if (undefined !== this.emission.annotations.applePodcast) count++;
        if (undefined !== this.emission.annotations.deezer) count++;
        if (undefined !== this.emission.annotations.googlePodcasts) count++;
        if (undefined !== this.emission.annotations.spotify) count++;
        if (undefined !== this.emission.annotations.tunein) count++;
        if (undefined !== this.emission.annotations.radioline) count++;
        if (undefined !== this.emission.annotations.podcastAddict) count++;
        if (undefined !== this.emission.annotations.playerFm) count++;
        if (undefined !== this.emission.annotations.stitcher) count++;
        if (undefined !== this.emission.annotations.pocketCasts) count++;
      }
      return count;
    },
  },
  watch: {
    emissionId(): void {
      this.getEmissionDetails();
    },
  },

  mounted() {
    this.getEmissionDetails();
  },
  methods: {
    async getEmissionDetails(): Promise<void> {
      this.loaded = false;
      this.error = false;
      try {
        const data: Emission = await octopusApi.fetchEmission(this.emissionId);
        this.emission = data;
        this.$emit('emissionTitle', this.name);
        this.loaded = true;
        if (!this.emission.annotations) return;
        this.rssEmission = this.emission.annotations.RSS? true: false;
        this.ftpEmission = this.emission.annotations.FTP? true: false;
        if (this.emission.annotations.exclusive) {
          this.exclusive =
            'true' === this.emission.annotations.exclusive ? true : false;
          this.exclusive =
            this.exclusive && this.organisationId !== this.emission.orga.id;
        }
        if (this.emission.annotations.notExclusive) {
          this.notExclusive =
            'true' === this.emission.annotations.notExclusive ? true : false;
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
})
</script>