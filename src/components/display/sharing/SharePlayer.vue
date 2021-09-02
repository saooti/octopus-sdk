<template>
  <div>
    <div class="module-box text-center-mobile">
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
            :width="iFrameWidth"
            :height="iFrameHeight"
            class="maxIframe"
          ></iframe>
          <div class="d-flex flex-column">
            <button class="btn mb-3" @click="isShareModal = true">
              {{ $t('Share the player') }}
            </button>
            <template v-if="!isLiveReadyToRecord">
              <label
                for="iframe-select"
                class="d-inline"
                aria-label="select miniplayer"
              ></label>
              <select
                v-model="iFrameModel"
                id="iframe-select"
                class="frame-select input-no-outline"
              >
                <option value="default">{{ $t('Default version') }}</option>
                <option value="large">{{ $t('Large version') }}</option>
                <template v-if="isBeta">
                    <option
                    v-for="player in customPlayers" :key="player.customId"
                    :value="player.customId" 
                    v-if="(('EPISODE' === player.typePlayer || 'SUGGESTION' === player.typePlayer) && podcast && podcast.podcastId) ||
                          ('EMISSION' === player.typePlayer && emission )|| ('PLAYLIST' === player.typePlayer && playlist )"
                    >{{ $t('Custom version') + " «" +player.name+"»" }}</option>
                </template>
                <option value="emission" v-if="podcast && podcast.podcastId">{{
                  $t('Emission version')
                }}</option>
                <option
                  value="largeEmission"
                  v-if="podcast && podcast.podcastId"
                  >{{ $t('Large emission version') }}</option
                >
                <option
                  value="largeSuggestion"
                  v-if="podcast && podcast.podcastId"
                  >{{ $t('Large suggestion version') }}</option
                >
              </select>
            </template>
          </div>
          <div class="d-flex justify-content-around mt-3 flex-grow w-100">
            <div class="d-flex flex-column align-items-center flex-shrink mr-3">
              <div class="font-weight-600">{{ $t('Choose color') }}</div>
              <swatches
                v-model="color"
                class="c-hand input-no-outline"
                show-fallback
                colors="text-advanced"
                popover-to="right"
                :data-color="color"
              ></swatches>
            </div>
            <div class="d-flex flex-column align-items-center">
              <div class="font-weight-600">{{ $t('Choose theme') }}</div>
              <div class="d-flex" v-if="!isBeta">
                <swatches v-for="color in colors" :key="color" v-model="theme" :data-theme="theme"
                  class="c-hand input-no-outline mr-1"
                  :swatch-style="{
                    padding: '0px 0px',
                    marginRight: '0px',
                    marginBottom: '0px',
                    border: '1px gray solid',
                  }"
                  :wrapper-style="{
                    paddingTop: '0px',
                    paddingLeft: '0px',
                    paddingRight: '0px',
                    paddingBottom: '0px',
                  }"
                  :colors="[color]"
                  inline
                ></swatches>
              </div>
              <swatches
                v-model="theme"
                class="c-hand input-no-outline"
                show-fallback
                colors="text-advanced"
                popover-to="right"
                :data-color="theme"
                v-else
              ></swatches>
            </div>
          </div>
          <div class="checkbox-saooti" v-if="displayBetaChoice">
            <input
              type="checkbox"
              class="custom-control-input"
              id="isBetaCheckbox"
              v-model="isBeta"
            />
            <label
              class="custom-control-label mr-2"
              for="isBetaCheckbox"
              >{{ $t('Use beta version') }}</label
            >
          </div>
          <div
            class="d-flex align-items-center flex-wrap"
            v-if="isPodcastNotVisible || playlist"
          >
            <div class="checkbox-saooti">
              <input
                type="checkbox"
                class="custom-control-input"
                id="isVisibleCheckbox"
                v-model="isVisible"
              />
              <label
                class="custom-control-label mr-2"
                for="isVisibleCheckbox"
                >{{ titleStillAvailable }}</label
              >
            </div>
          </div>
        </div>
        <PlayerParameters
          v-if="isPlayerParameter"
          :podcast="podcast"
          :playlist="playlist"
          :iFrameModel="iFrameModel"
          :isVisible="isVisible"
          @displayArticle="updateDisplayArticle"
          @episodeNumbers="updateEpisodeNumber"
          @proceedReading="updateProceedReading"
          @isVisible="updateIsVisible"
          @iFrameNumber="updateIframeNumber"
          @startTime="updateStartTime"
        />
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
      @close="isShareModal = false"
      :embedLink="iFrame"
      :embedlyLink="iFrameSrc"
      :directLink="podcast"
    ></ShareModalPlayer>
  </div>
</template>

<style lang="scss">
@import '../../../sass/_variables.scss';
.sticker {
  align-self: center;
  background: rgba($octopus-primary-color, 0.3);
  padding: 0.5rem;
  transition: all 0.5s ease;
  color: #41403e;
  letter-spacing: 1px;
  outline: none;
  box-shadow: 10px 10px 34px -15px hsla(0, 0%, 0%, 0.4);
  border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
  border: solid 2px #41403e;
  &:hover {
    box-shadow: 2px 8px 4px -6px hsla(0, 0%, 0%, 0.3);
  }
}
.maxIframe {
  max-width: 300px;
}
</style>

<script lang="ts">
import { state } from '../../../store/paramStore';
//@ts-ignore
import Swatches from 'vue-swatches';
import 'vue-swatches/dist/vue-swatches.min.css';
import profileApi from '@/api/profile';
const octopusApi = require('@saooti/octopus-api');
import Vue from 'vue';
import { Podcast } from '@/store/class/podcast';
import { Emission } from '@/store/class/emission';
import { Playlist } from '@/store/class/playlist';
import { CustomPlayer } from '@/store/class/customPlayer';
export default Vue.extend({
  props: {
    podcast: { default: undefined as Podcast|undefined},
    emission: { default: undefined as Emission|undefined},
    playlist: { default: undefined as Playlist|undefined},
    organisationId: { default: undefined as string|undefined},
    isEducation: { default: false as boolean},
    exclusive: { default: false as boolean},
    notExclusive: { default: true as boolean},
  },
  components: {
    ShareModalPlayer: () => import('../../misc/modal/ShareModalPlayer.vue'),
    Swatches,
    PlayerParameters: () => import('./PlayerParameters.vue'),
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
      startTime: 0 as number,
      isVisible: false as boolean,
      displayArticle: true as boolean,
      displayBetaChoice: false as boolean,
      customPlayers: [] as Array<CustomPlayer>,
      isBeta: false as boolean,
      colors: ['#000000', '#ffffff'],
    };
  },
  async created() {
    await this.initColor();
    if (this.isLiveReadyToRecord) {
      this.iFrameModel = 'large';
    }
  },
  
  computed: {
    miniplayerBaseUrl(): string{
      if(this.isBeta){
        return state.podcastPage.MiniplayerBetaUri;  
      }
      return state.podcastPage.MiniplayerUri;
    },
    isEmission(): boolean {
      return 'emission' === this.iFrameModel;
    },
    isLargeEmission(): boolean {
      return 'largeEmission' === this.iFrameModel;
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
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    iFrameSrc(): string {
      const url = [''];
      let iFrameNumber = '/' + this.iFrameNumber;
      if (
        (!this.podcast || this.isEmission || this.isLargeEmission) &&
        'all' === this.episodeNumbers
      ) {
        iFrameNumber = '/0';
      }
      if (!this.podcast && !this.playlist) {
        if ('default' === this.iFrameModel) {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/emission/${this.emission.emissionId}${iFrameNumber}`
          );
        }else {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/emissionLarge/${this.emission.emissionId}${iFrameNumber}`
          );
        }
      } else if (this.playlist) {
        if ('default' === this.iFrameModel) {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/playlist/${this.playlist.playlistId}`
          );
        } else {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/playlistLarge/${this.playlist.playlistId}`
          );
        }
      } else {
        if (this.isEmission || this.isLargeEmission) {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/${this.iFrameModel}/${this.emission.emissionId}${iFrameNumber}/${this.podcast.podcastId}`
          );
        } else if (this.isLargeSuggestion) {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/${this.iFrameModel}/${this.podcast.podcastId}${iFrameNumber}`
          );
        }  else {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/${this.iFrameModel}/${this.podcast.podcastId}`
          );
        }
      }
      url.push('?distributorId=' + this.organisationId);
      url.push(
        '&color=' +
          this.color.substring(1) +
          '&theme=' +
          this.theme.substring(1)
      );
      if (!this.proceedReading) {
        url.push('&proceed=false');
      }
      if(!this.displayArticle){
        url.push('&article=false');
      }
      url.push('&time=' + this.startTime);
      if (this.isVisible) {
        url.push('&key=' + window.btoa(this.dataTitle.toString()));
      }
      return url.join('');
    },
    iFrameWidth(): string {
      return '100%';
    },
    iFrameHeight(): string {
      switch (this.iFrameModel) {
        case 'large':
          if (this.podcast) return '180px';
          if ('number' === this.episodeNumbers) {
            switch (this.iFrameNumber) {
              case '1':
                return '185px';
              case '2':
                return '240px';
              case '3':
                return '290px';
              case '4':
                return '345px';
              case '5':
                return '390px';
              default:
                return '435px';
            }
          }
          return '435px';
        case 'largeEmission':
        case 'largeSuggestion':
          if ('number' !== this.episodeNumbers) return '510px';
          switch (this.iFrameNumber) {
            case '1':
              return '260px';
            case '2':
              return '315px';
            case '3':
              return '365px';
            case '4':
              return '420px';
            case '5':
              return '465px';
            default:
              return '510px';
          }
        case 'emission':
          return '530px';
        default:
          if (this.podcast) return '520px';
          return '530px';
      }
    },
    iFrame(): string {
      return `<iframe src="${this.iFrameSrc}" width="${this.iFrameWidth}" height="${this.iFrameHeight}" scrolling="no" frameborder="0"></iframe>`;
    },
    isPodcastNotVisible(): boolean {
      return (
        this.podcast &&
        !this.podcast.availability.visibility &&
        ('default' === this.iFrameModel || 'large' === this.iFrameModel)
      );
    },
    dataTitle(): number {
      if (this.podcast) return this.podcast.podcastId;
      if (this.emission) return this.emission.emissionId;
      return this.playlist.playlistId;
    },
    isPlayerParameter(): boolean{
      return !this.podcast || (this.podcast.article && 0 !== this.podcast.article.length) || this.isEmission || this.isLargeEmission || this.isLargeSuggestion;
    }
  },
  methods: {
    /* getOrganisationId(): string{
      let orgaId = undefined;
      if (this.podcast) {
        orgaId = this.podcast.organisation.id;
      } else if (this.playlist) {
        orgaId = this.playlist.organisation.id;
      } else {
        orgaId = this.emission.orga.id;
      }
      return orgaId;
    },
    async initBeta(): Promise<void> {
      const orgaId = this.getOrganisationId();
      const data: any = await octopusApi.fetchOrganisationAttributes(orgaId);
      if (data.hasOwnProperty('playerBeta')) {
        this.isBeta = data.playerBeta;
      }
    }, */
    async initColor(): Promise<void> {
      if (!this.authenticated) return;
      let data;
      if(this.$store.state.organisation && this.$store.state.organisation.attributes && Object.keys(this.$store.state.organisation.attributes).length > 1){
        data = this.$store.state.organisation.attributes;
      }else{
        data= await profileApi.fetchOrganisationAttibutes(
          this.$store.state,
          state.generalParameters.organisationId
        );
      }
      if (data.hasOwnProperty('COLOR')) {
        this.color = data.COLOR;
      } else {
        this.color = '#40a372';
      }
      if (data.hasOwnProperty('THEME')) {
        this.theme = data.THEME;
      } else {
        this.theme = '#ffffff';
      }
      if (data.hasOwnProperty('playerBeta')) {
        this.displayBetaChoice = data.playerBeta;
        let dataFetched = await octopusApi.fetchCustomPlayer('customPlayer/organisation/'+ this.organisationId!);
        this.customPlayers = dataFetched.content;
        let totalCount = dataFetched.totalElements;
        let index = 1;
        while (totalCount > this.customPlayers.length) {
          dataFetched =  await octopusApi.fetchCustomPlayer('customPlayer/organisation/'+ this.organisationId!+'?start='+index);
          this.customPlayers = this.customPlayers.concat(dataFetched.content);
          ++index;
        }
      }
      return;
    },
    updateEpisodeNumber(value: string): void {
      this.episodeNumbers = value;
    },
    updateProceedReading(value: boolean): void {
      this.proceedReading = value;
    },
    updateIframeNumber(value: string): void {
      this.iFrameNumber = value;
    },
    updateStartTime(value: number): void {
      this.startTime = value;
    },
    updateIsVisible(value: boolean): void {
      this.isVisible = value;
    },
    updateDisplayArticle(value: boolean): void{
      this.displayArticle = value;
    }
  },
});
</script>
