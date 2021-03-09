<template>
  <div>
    <div class="page-box" v-if="loaded && !error">
      <h1 v-if="!isOuestFrance">{{ $t('Emission') }}</h1>
      <div class="d-flex">
        <div class="d-flex flex-column flex-grow">
          <EditBox
            :emission="emission"
            :rssEmission="rssEmission"
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
import EditBox from '@/components/display/edit/EditBox.vue';
import SharePlayer from '../display/sharing/SharePlayer.vue';
import ShareButtons from '../display/sharing/ShareButtons.vue';
import SubscribeButtons from '../display/sharing/SubscribeButtons.vue';
import ShareDistribution from '../display/sharing/ShareDistribution.vue';
import PodcastFilterList from '../display/podcasts/PodcastFilterList.vue';
import PodcastList from '../display/podcasts/PodcastList.vue';
import LiveHorizontalList from '../display/live/LiveHorizontalList.vue';
const octopusApi = require('@saooti/octopus-api');
import { state } from '../../store/paramStore.js';
import { displayMethods } from '../mixins/functions';

import { defineComponent } from 'vue'
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
  },

  mixins: [displayMethods],

  mounted() {
    this.getEmissionDetails(this.emissionId);
  },

  props: ['emissionId', 'isEducation'],

  data() {
    return {
      loaded: false,
      title: '',
      emission: undefined as any,
      error: false,
      rssEmission: false,
      exclusive: false,
      notExclusive: false,
      isReady: true,
      dummyParam: new Date().getTime().toString(),
      fetchLive: true,
    };
  },

  computed: {
    organisationId() {
      return state.generalParameters.organisationId;
    },
    authenticated() {
      return state.generalParameters.authenticated;
    },

    isEditBox() {
      return state.podcastPage.EditBox;
    },
    isShareButtons() {
      return state.podcastPage.ShareButtons;
    },
    isSharePlayer() {
      return state.podcastPage.SharePlayer;
    },
    isShareDistribution() {
      return state.podcastPage.ShareDistribution;
    },
    isOuestFrance() {
      return state.emissionPage.ouestFranceStyle;
    },
    isRssButton() {
      return state.emissionPage.rssButton;
    },
    isPodcastmaker() {
      return state.generalParameters.podcastmaker;
    },
    rssUrl():string {
      return state.generalParameters.ApiUri + 'rss/emission/' + this.emissionId;
    },
    name():string {
      return this.emission ? this.emission.name : '';
    },

    imageUrl():string {
      return this.emission
        ? this.emission.imageUrl + '?dummy=' + this.dummyParam
        : '';
    },

    description():string {
      return this.emission ? this.emission.description : '';
    },

    editRight() {
      if (
        (this.authenticated && this.organisationId === this.emission.orga.id) ||
        state.generalParameters.isAdmin
      )
        return true;
      return false;
    },
    countLink() {
      let count = 0;
      if (this.emission && this.emission.annotations) {
        if (undefined !== this.emission.annotations.applePodcast) count++;
        if (undefined !== this.emission.annotations.deezer) count++;
        if (undefined !== this.emission.annotations.spotify) count++;
        if (undefined !== this.emission.annotations.tunein) count++;
        if (undefined !== this.emission.annotations.tootak) count++;
        if (undefined !== this.emission.annotations.radioline) count++;
      }
      return count;
    },
  },

  watch: {
    emissionId(val) {
      this.loaded = false;
      this.error = false;
      this.getEmissionDetails(val);
    },
  },

  methods: {
    async getEmissionDetails(emissionId:number) {
      try {
        const data = await octopusApi.fetchEmission(emissionId);
        this.emission = data;
        this.$emit('emissionTitle', this.name);
        this.loaded = true;
        if (!this.emission.annotations) return;
        if (this.emission.annotations.RSS) {
          this.rssEmission = true;
        }
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
});
</script>
