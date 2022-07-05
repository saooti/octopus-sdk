<template>
  <div>
    <div class="module-box text-center-mobile overflow-visible">
      <h3>{{ $t('Embed') }}</h3>
      <template v-if="!exclusive && (authenticated || notExclusive)">
        <div class="d-flex flex-column align-items-center">
          <div
            v-if="noAd && !isEducation"
            class="sticker"
            :title="$t('You cannot insert advertising')"
          >
            {{ $t('No advertising') }}
          </div>
          <iframe
            title="miniplayer"
            :src="iFrameSrc"
            scrolling="no"
            frameborder="0"
            width="100%"
            :height="iFrameHeight"
            class="max-iframe my-2"
          />
          <SharePlayerTypes 
            v-if="!isLiveReadyToRecord"
            v-model:iFrameModel="iFrameModel"
            :podcast="podcast"
            :emission="emission"
            :playlist="playlist"
            :organisation-id="organisationId"
          />
          <SharePlayerColors
            v-model:color="color"
            v-model:theme="theme"
          />
          <ClassicCheckbox
            v-if="isPodcastNotVisible || playlist"
            v-model:textInit="isVisible"
            id-checkbox="is-visible-checkbox"
            :label="titleStillAvailable"
          />
        </div>
        <PlayerParameters
          v-if="isPlayerParameter"
          :is-visible="isVisible"
          :chose-number-episode="displayChoiceAllEpisodes|| isLargeSuggestion"
          :display-choice-all-episodes="displayChoiceAllEpisodes"
          @displayArticle="displayArticle = $event"
          @episodeNumbers="episodeNumbers = $event"
          @proceedReading="proceedReading = $event"
          @isVisible="isVisible = $event"
          @iFrameNumber="iFrameNumber = $event"
        />
        <div class="d-flex flex-column align-items-center mt-3">
          <button
            class="btn btn-primary mb-3"
            @click="isShareModal = true"
          >
            {{ $t('Share the player') }}
          </button>
        </div>
      </template>
      <div v-else-if="exclusive && authenticated">
        {{ $t('Only organisation members can share the content') }}
      </div>
      <div v-else-if="!authenticated">
        {{ $t('Only authenticated members can share the content') }}
      </div>
    </div>
    <ShareModalPlayer
      v-if="isShareModal"
      :embed-link="iFrame"
      :embedly-link="iFrameSrc"
      :direct-link="podcast"
      @close="isShareModal = false"
    />
  </div>
</template>

<script lang="ts">
import { orgaComputed } from '../../mixins/orgaComputed';
import { state } from '../../../store/paramStore';
import octopusApi from '@saooti/octopus-api';
import { Podcast } from '@/store/class/general/podcast';
import { Emission } from '@/store/class/general/emission';
import { Playlist } from '@/store/class/general/playlist';
import { defineComponent, defineAsyncComponent } from 'vue';
const ShareModalPlayer = defineAsyncComponent(() => import('../../misc/modal/ShareModalPlayer.vue'));
const PlayerParameters = defineAsyncComponent(() => import('./PlayerParameters.vue'));
const SharePlayerTypes = defineAsyncComponent(() => import('./SharePlayerTypes.vue'));
const SharePlayerColors = defineAsyncComponent(() => import('./SharePlayerColors.vue'));
const ClassicCheckbox = defineAsyncComponent(() => import('../../form/ClassicCheckbox.vue'));
export default defineComponent({
  components: {
    ShareModalPlayer,
    SharePlayerColors,
    PlayerParameters,
    SharePlayerTypes,
    ClassicCheckbox
  },
  mixins:[orgaComputed],
  props: {
    podcast: { default: undefined, type: Object as ()=> Podcast},
    emission: { default: undefined, type: Object as ()=> Emission},
    playlist: { default: undefined, type: Object as ()=> Playlist},
    organisationId: { default: undefined, type: String},
    isEducation: { default: false, type: Boolean},
    exclusive: { default: false, type: Boolean},
    notExclusive: { default: true, type: Boolean},
  },

  data() {
    return {
      iFrameModel: 'default' as string,
      isShareModal: false as boolean,
      color: '#40a372' as string,
      theme: '#000000' as string,
      proceedReading: true as boolean,
      episodeNumbers: 'number' as string,
      iFrameNumber: '3' as string,
      isVisible: false as boolean,
      displayArticle: true as boolean,
      colors: ['#000000', '#ffffff'],
    };
  },
  
  computed: {
    displayChoiceAllEpisodes():boolean{
      return !this.podcast || this.isEmission || this.isLargeEmission;
    },
    baseUrl(): string{
      return (state.podcastPage.MiniplayerUri as string); 
    },
    isEmission(): boolean {
      return 'emission' === this.iFrameModel;
    },
    isLargeEmission(): boolean {
      return 'emissionLarge' === this.iFrameModel;
    },
    isLargeSuggestion(): boolean {
      return 'largeSuggestion' === this.iFrameModel;
    },
    titleStillAvailable(): string {
      if (this.isPodcastNotVisible) return this.$t('Podcast still available').toString();
      return this.$t('Podcasts still available').toString();
    },
    isLiveReadyToRecord(): boolean {
      if (this.podcast)
        return (
          undefined !== this.podcast.conferenceId &&
          0 !== this.podcast.conferenceId &&
          this.podcast.processingStatus === 'READY_TO_RECORD'
        );
      return false;
    },
    noAd(): boolean {
      if (
        (this.podcast &&
          this.podcast.organisation.id !== this.organisationId &&
          'NO' === this.podcast.monetisable) ||
        (this.podcast &&
          'UNDEFINED' === this.podcast.monetisable &&
          'NO' === this.podcast.emission.monetisable)
      ) {
        return true;
      }
      return false;
    },
    iFrameSrc(): string {
      const url = [''];
      let iFrameNumber = this.displayChoiceAllEpisodes && 'all' === this.episodeNumbers ? '/0' : '/' + this.iFrameNumber;
      url.push(`${this.baseUrl}miniplayer/`);
      if (!this.podcast && !this.playlist && this.emission) {
        switch (this.iFrameModel) {
          case 'default': url.push('emission'); break;
          case 'large': url.push('emissionLarge'); break;
          default: url.push(`${this.iFrameModel}`);break;
        }
        url.push(`/${this.emission.emissionId}${iFrameNumber}`);
      } else if (this.playlist) {
        switch (this.iFrameModel) {
          case 'default': url.push('playlist'); break;
          case 'large': url.push('playlistLarge'); break;
          default: url.push(`${this.iFrameModel}`);break;
        }
        url.push(`/${this.playlist.playlistId}`);
      } else if(this.emission && this.podcast){
        url.push(`${this.iFrameModel}/`);
        if (this.isEmission || this.isLargeEmission) {
          url.push(`${this.emission.emissionId}${iFrameNumber}/${this.podcast.podcastId}`);
        } else if (this.isLargeSuggestion) {
          url.push(`${this.podcast.podcastId}${iFrameNumber}`);
        }  else {
          url.push(`${this.podcast.podcastId}`);
        }
      }
      url.push('?distributorId=' + this.organisationId);
      url.push(`&color=${this.color.substring(1)}&theme=${this.theme.substring(1)}`);
      if (!this.proceedReading) {
        url.push('&proceed=false');
      }
      if(!this.displayArticle){
        url.push('&article=false');
      }
      if (this.isVisible) {
        url.push('&key=' + window.btoa(this.dataTitle.toString()));
      }
      return url.join('');
    },
    iFrameHeight(): string {
      switch (this.iFrameModel) {
        case 'large':
          if (this.podcast) return '180px';
          if ('number' === this.episodeNumbers) {
            switch (this.iFrameNumber.toString()) {
              case '1': return '270px';
              case '2': return '320px';
              case '3': return '360px';
              case '4': return '420px';
              case '5': return '420px';
              default: return '420px';
            }
          }
          return '435px';
        case 'emissionLarge':
        case 'largeSuggestion':
          if ('number' !== this.episodeNumbers) return '510px';
          switch (this.iFrameNumber.toString()) {
            case '1':return '315px';
            case '2':return '365px';
            case '3':return '420px';
            case '4':return '470px';
            case '5':return '470px';
            default:return '470px';
          }
        case 'emission':return '530px';
        default:
          if (this.podcast) return '520px';
          return '530px';
      }
    },
    iFrame(): string {
      return `<iframe src="${this.iFrameSrc}" width="100%" height="${this.iFrameHeight}" scrolling="no" frameborder="0"></iframe>`;
    },
    isPodcastNotVisible(): boolean {
      return (
        undefined !== this.podcast &&
        !this.podcast.availability.visibility &&
        ('default' === this.iFrameModel || 'large' === this.iFrameModel)
      );
    },
    dataTitle(): number {
      if (this.podcast) return this.podcast.podcastId;
      if (this.emission) return this.emission.emissionId;
      if (this.playlist) return this.playlist.playlistId;
      return 0;
    },
    isPlayerParameter(): boolean{
      return (!this.podcast || (this.podcast.article && 0 !== this.podcast.article.length) || this.isEmission || this.isLargeEmission || this.isLargeSuggestion) && !this.playlist;
    }
  },
  async created() {
    await this.initColor();
    if (this.isLiveReadyToRecord) {
      this.iFrameModel = 'large';
    }
  },
  methods: {
    async initColor(): Promise<void> {
      if (!this.authenticated) return;
      let data;
      if(this.$store.state.organisation && this.$store.state.organisation.attributes && Object.keys(this.$store.state.organisation.attributes).length > 1){
        data = this.$store.state.organisation.attributes;
      }else{
        data= await octopusApi.fetchData<{[key:string]:string}>(0, 'organisation/attributes/'+this.myOrganisationId);
      }
      this.color = Object.prototype.hasOwnProperty.call(data,'COLOR') ? data.COLOR : '#40a372';
      this.theme = Object.prototype.hasOwnProperty.call(data,'THEME') ? data.THEME : '#000000';
    },
  },
})
</script>

<style lang="scss">
@import '../../../sass/_variables.scss';
.octopus-app{
  .sticker {
    align-self: center;
    background: $octopus-primary-dark;
    padding: 0.5rem;
    transition: all 0.5s ease;
    color: white;
    font-weight: bold;
    letter-spacing: 1px;
    box-shadow: 10px 10px 34px -15px hsla(0, 0%, 0%, 0.4);
    border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
    border: solid 2px #41403e;
    &:hover {
      box-shadow: 2px 8px 4px -6px hsla(0, 0%, 0%, 0.3);
      background: transparent;
      color: $octopus-primary-dark;
    }
  }
  .max-iframe {
    max-width: 300px;
  }
}
</style>