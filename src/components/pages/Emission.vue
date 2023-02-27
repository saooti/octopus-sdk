<template>
  <div class="page-box">
    <div
      v-if="loaded && !error"
    >
      <h1>{{ $t('Emission') }}</h1>
      <div class="d-flex">
        <div class="d-flex flex-column flex-grow-1">
          <EditBox
            v-if="editRight && pageParameters.isEditBox"
            :emission="emission"
            :rss-emission="rssEmission"
            :ftp-emission="ftpEmission"
            @isUpdated="getEmissionDetails"
          />
          <div class="module-box">
            <h2>
              {{ name }}
            </h2>
            <div class="mb-5 mt-3 descriptionText">
              <img
                v-lazy="proxyImageUrl(imageUrl, '260')"
                width="260"
                height="260"
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
          </div>
          <SubscribeButtons
            v-if="pageParameters.isShareButtons && countLink >= 1"
            :emission="emission"
          />
        </div>
        <div class="d-flex flex-column flex-grow-mobile">
          <SharePlayer
            v-if="pageParameters.isSharePlayer && (authenticated || notExclusive)"
            :emission="emission"
            :exclusive="exclusive"
            :not-exclusive="notExclusive"
            :organisation-id="myOrganisationId"
            :is-education="isEducation"
          />
          <ShareButtons
            v-if="pageParameters.isShareButtons"
            :emission="emission"
            :is-vertical="!authenticated && !notExclusive"
          />
        </div>
      </div>
      <div v-if="editRight">
        <ShareDistribution
          v-if="pageParameters.isShareDistribution"
          :emission-id="emissionId"
        />
      </div>
      <template v-if="pageParameters.isDisplayPodcasts">
        <LiveHorizontalList
          v-if="!isPodcastmaker"
          :emission-id="emissionId"
        />
        <PodcastFilterList
          :show-count="true"
          :emission-id="emissionId"
          :category-filter="false"
          :edit-right="editRight"
          :productor-id="emission.orga.id"
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
import { state } from '../../stores/ParamSdkStore';
import displayMethods from '../mixins/displayMethods';
import imageProxy from '../mixins/imageProxy';
import { orgaComputed } from '../mixins/orgaComputed';
import { handle403 } from '../mixins/handle403';
import { Emission } from '@/stores/class/general/emission';
import ClassicLoading from '../form/ClassicLoading.vue';
import { defineComponent, defineAsyncComponent } from 'vue';
import { AxiosError } from 'axios';
const PodcastFilterList = defineAsyncComponent(() => import('../display/podcasts/PodcastFilterList.vue'));
const SharePlayer = defineAsyncComponent(() => import('../display/sharing/SharePlayer.vue'));
const ShareButtons = defineAsyncComponent(() => import('../display/sharing/ShareButtons.vue'));
const ShareDistribution = defineAsyncComponent(() => import('../display/sharing/ShareDistribution.vue'));
const EditBox = defineAsyncComponent(() => import('@/components/display/edit/EditBox.vue'));
const SubscribeButtons = defineAsyncComponent(() => import('../display/sharing/SubscribeButtons.vue'));
const LiveHorizontalList = defineAsyncComponent(() => import('../display/live/LiveHorizontalList.vue'));
export default defineComponent({
  components: {
    PodcastFilterList,
    SharePlayer,
    ShareButtons,
    ShareDistribution,
    EditBox,
    SubscribeButtons,
    LiveHorizontalList,
    ClassicLoading
  },
  mixins: [displayMethods, handle403, orgaComputed, imageProxy],
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
      fetchLive: true as boolean,
    };
  },
  
  computed: {
    pageParameters(){
      return {
        isEditBox : (state.podcastPage.EditBox as boolean),
        isShareButtons: (state.podcastPage.ShareButtons as boolean),
        isSharePlayer: (state.podcastPage.SharePlayer as boolean),
        isShareDistribution:(state.podcastPage.ShareDistribution as boolean),
        isDisplayPodcasts:(state.emissionPage.isDisplayPodcasts as boolean),
      };
    },
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    rssUrl(): string {
      return `${state.generalParameters.ApiUri}rss/emission/${this.emissionId}`;
    },
    name(): string {
      return this.emission?.name??'';
    },
    imageUrl(): string {
      return this.emission? `${this.emission.imageUrl}`:'';
    },
    description(): string {
      return this.emission?.description??'';
    },
    editRight(): boolean {
      return (true===this.authenticated && this.myOrganisationId === this.emission?.orga.id) ||
        true===state.generalParameters.isAdmin
    },
    countLink(): number {
      const platformShare = ['amazon','googlePodcasts','applePodcast', 'deezer', 'spotify', 'tunein',
       'radioline', 'podcastAddict', 'playerFm', 'stitcher', 'pocketCasts'];
      let count = 0;
      for (let i = 0, len = platformShare.length; i < len; i++) {
        if (undefined !== this.emission?.annotations?.[platformShare[i]]) count++;
      }
      return count;
    },
  },
  watch: {
    emissionId: {
      immediate: true,
      handler() {
        this.getEmissionDetails();
      },
    },
  },
  methods: {
    initError():void{
      this.error = true;
      this.loaded = true;
    },
    handleAnnotations(){
      if (!this.emission || !this.emission.annotations) return;
      this.rssEmission = 'RSS'===this.emission.annotations.SOURCE_KIND? true: false;
      this.ftpEmission = 'FTP'===this.emission.annotations.SOURCE_KIND? true: false;
      if (this.emission.annotations.exclusive) {
        this.exclusive ='true' === this.emission.annotations.exclusive;
        this.exclusive =this.exclusive && this.myOrganisationId !== this.emission.orga.id;
      }
      if (this.emission.annotations.notExclusive) {
        this.notExclusive ='true' === this.emission.annotations.notExclusive;
      }
    },
    async getEmissionDetails(): Promise<void> {
      this.loaded = false;
      this.error = false;
      try {
        this.emission = await octopusApi.fetchData<Emission>(0,'emission/'+this.emissionId);
        if("PUBLIC"!==this.emission.orga.privacy && this.filterOrgaId!==this.emission.orga.id){
          this.initError();
          return;
        }
        this.$emit('emissionTitle', this.name);
        this.loaded = true;
        this.handleAnnotations();
      } catch(error) {
        this.handle403((error as AxiosError));
        this.initError();
      }
    },
  },
})
</script>