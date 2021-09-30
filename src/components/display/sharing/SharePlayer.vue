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
          />
          <div class="d-flex flex-column">
            <button
              class="btn mb-3"
              @click="isShareModal = true"
            >
              {{ $t('Share the player') }}
            </button>
            <template v-if="!isLiveReadyToRecord">
              <label
                for="iframe-select"
                class="d-inline"
                aria-label="select miniplayer"
              />
              <select
                id="iframe-select"
                v-model="iFrameModel"
                class="frame-select input-no-outline"
              >
                <option value="default">
                  {{ $t('Default version') }}
                </option>
                <option value="large">
                  {{ $t('Large version') }}
                </option>
                <template v-if="isBeta">
                  <option
                    v-for="player in customPlayersDisplay"
                    :key="player.customId"
                    :value="player.customId"
                  >
                    {{ $t('Custom version') + " «" +player.name+"»" }}
                  </option>
                </template>
                <option
                  v-if="podcast && podcast.podcastId"
                  value="emission"
                >
                  {{
                    $t('Emission version')
                  }}
                </option>
                <option
                  v-if="podcast && podcast.podcastId"
                  value="largeEmission"
                >
                  {{ $t('Large emission version') }}
                </option>
                <option
                  v-if="podcast && podcast.podcastId"
                  value="largeSuggestion"
                >
                  {{ $t('Large suggestion version') }}
                </option>
              </select>
            </template>
          </div>
          <div class="d-flex justify-content-around mt-3 flex-grow w-100">
            <div class="d-flex flex-column align-items-center flex-shrink me-3">
              <div class="fw-600">
                {{ $t('Choose color') }}
              </div>
              <VSwatches
                v-model="color"
                class="c-hand input-no-outline"
                show-fallback
                colors="text-advanced"
                popover-to="right"
                :data-color="color"
              />
            </div>
            <div class="d-flex flex-column align-items-center">
              <div class="fw-600">
                {{ $t('Choose theme') }}
              </div>
              <div
                v-if="!isBeta"
                class="d-flex"
              >
                <VSwatches
                  v-for="myColor in colors"
                  :key="myColor"
                  v-model="theme"
                  :data-theme="theme"
                  class="c-hand input-no-outline me-1"
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
                  :swatches="[myColor]"
                  inline
                />
              </div>
              <VSwatches
                v-else
                v-model="theme"
                class="c-hand input-no-outline"
                show-fallback
                colors="text-advanced"
                popover-to="right"
                :data-color="theme"
              />
            </div>
          </div>
          <div
            v-if="displayBetaChoice"
            class="checkbox-saooti"
          >
            <input
              id="isBetaCheckbox"
              v-model="isBeta"
              type="checkbox"
              class="custom-control-input"
            >
            <label
              class="custom-control-label me-2"
              for="isBetaCheckbox"
            >{{ $t('Use beta version') }}</label>
          </div>
          <div
            v-if="isPodcastNotVisible || playlist"
            class="d-flex align-items-center flex-wrap"
          >
            <div class="checkbox-saooti">
              <input
                id="isVisibleCheckbox"
                v-model="isVisible"
                type="checkbox"
                class="custom-control-input"
              >
              <label
                class="custom-control-label me-2"
                for="isVisibleCheckbox"
              >{{ titleStillAvailable }}</label>
            </div>
          </div>
        </div>
        <PlayerParameters
          v-if="isPlayerParameter"
          :podcast="podcast"
          :playlist="playlist"
          :i-frame-model="iFrameModel"
          :is-visible="isVisible"
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
      :embed-link="iFrame"
      :embedly-link="iFrameSrc"
      :direct-link="podcast"
      @close="isShareModal = false"
    />
  </div>
</template>

<script lang="ts">
import { state } from '../../../store/paramStore';
import VSwatches from 'vue3-swatches';
import profileApi from '@/api/profile';
const octopusApi = require('@saooti/octopus-api');
import { Podcast } from '@/store/class/podcast';
import { Emission } from '@/store/class/emission';
import { Playlist } from '@/store/class/playlist';
import { CustomPlayer } from '@/store/class/customPlayer';
import { defineComponent, defineAsyncComponent } from 'vue';
const ShareModalPlayer = defineAsyncComponent(() => import('../../misc/modal/ShareModalPlayer.vue'));
const PlayerParameters = defineAsyncComponent(() => import('./PlayerParameters.vue'));
export default defineComponent({
  components: {
    ShareModalPlayer,
    VSwatches,
    PlayerParameters,
  },

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
      startTime: 0 as number,
      isVisible: false as boolean,
      displayArticle: true as boolean,
      displayBetaChoice: false as boolean,
      customPlayers: [] as Array<CustomPlayer>,
      isBeta: false as boolean,
      colors: ['#000000', '#ffffff'],
    };
  },
  
  computed: {
    customPlayersDisplay(): Array<CustomPlayer>{
      return this.customPlayers.filter((player: CustomPlayer)=>{
        return (('EPISODE' === player.typePlayer ||'SUGGESTION' === player.typePlayer) && this.podcast && this.podcast.podcastId) ||
                          ('EMISSION' === player.typePlayer && this.emission  && !this.podcast)|| ('PLAYLIST' === player.typePlayer && this.playlist );
      });
    },
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
      if (!this.podcast && !this.playlist && this.emission) {
        if ('default' === this.iFrameModel) {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/emission/${this.emission.emissionId}${iFrameNumber}`
          );
        }else if('large' === this.iFrameModel) {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/emissionLarge/${this.emission.emissionId}${iFrameNumber}`
          );
        }
        else {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/${this.iFrameModel}/${this.emission.emissionId}${iFrameNumber}`
          );
        }
      } else if (this.playlist) {
        if ('default' === this.iFrameModel) {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/playlist/${this.playlist.playlistId}`
          );
        } else if('large' === this.iFrameModel) {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/playlistLarge/${this.playlist.playlistId}`
          );
        }else {
          url.push(
            `${this.miniplayerBaseUrl}miniplayer/${this.iFrameModel}/${this.playlist.playlistId}`
          );
        }
      } else if(this.emission && this.podcast){
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
      return !this.podcast || (this.podcast.article && 0 !== this.podcast.article.length) || this.isEmission || this.isLargeEmission || this.isLargeSuggestion;
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
        data= await profileApi.fetchOrganisationAttibutes(
          this.$store.state,
          state.generalParameters.organisationId
        );
      }
      if (Object.prototype.hasOwnProperty.call(data,'COLOR')) {
        this.color = data.COLOR;
      } else {
        this.color = '#40a372';
      }
      if (Object.prototype.hasOwnProperty.call(data,'THEME')) {
        this.theme = data.THEME;
      } else {
        this.theme = '#ffffff';
      }
      if (Object.prototype.hasOwnProperty.call(data,'playerBeta')) {
        this.displayBetaChoice = data.playerBeta;
        let dataFetched = await octopusApi.fetchCustomPlayer('customPlayer/organisation/'+ this.organisationId!);
        this.customPlayers = dataFetched.content;
        const totalCount = dataFetched.totalElements;
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
})
</script>

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