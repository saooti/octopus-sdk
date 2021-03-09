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
              <div class="d-flex">
                <swatches
                  v-model="theme"
                  :data-theme="theme"
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
                  :colors="['#000000']"
                  inline
                ></swatches>
                <swatches
                  v-model="theme"
                  :data-theme="theme"
                  class="c-hand input-no-outline"
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
                  :colors="['#ffffff']"
                  inline
                ></swatches>
              </div>
            </div>
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
          v-if="!podcast || isEmission || isLargeEmission || isLargeSuggestion"
          :podcast="podcast"
          :playlist="playlist"
          :iFrameModel="iFrameModel"
          :isVisible="isVisible"
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
.custom-radio .custom-control-label {
  cursor: pointer;
}
.input-share-player {
  border: 1px solid #ddd;
  border-radius: 50px;
  &#number-input {
    margin: 0 1rem;
    width: 60px;
  }
}
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
.vue-swatches__container {
  padding: 0 !important;
  background-color: transparent !important;
}
.vue-swatches__swatch--selected {
  border: 2px #40a372 solid !important;
  box-shadow: unset !important;
  -webkit-box-shadow: unset !important;
}
</style>

<script lang="ts">
import ShareModalPlayer from '../../misc/modal/ShareModalPlayer.vue';
import PlayerParameters from './PlayerParameters.vue';
import { state } from '../../../store/paramStore';
//@ts-ignore
import Swatches from 'vue-swatches';
import 'vue-swatches/dist/vue-swatches.min.css';
import profileApi from '@/api/profile';

import { defineComponent } from 'vue'
export default defineComponent({
  props: [
    'podcast',
    'emission',
    'organisationId',
    'exclusive',
    'notExclusive',
    'playlist',
    'isEducation',
  ],

  components: {
    ShareModalPlayer,
    Swatches,
    PlayerParameters,
  },

  async created() {
    await this.initColor();
    if (this.isLiveReadyToRecord) {
      this.iFrameModel = 'large';
    }
  },

  data() {
    return {
      iFrameModel: 'default',
      isShareModal: false,
      color: '#40a372',
      theme: '#ffffff',
      proceedReading: true,
      episodeNumbers: 'number',
      iFrameNumber: '3',
      startTime: 0,
      isVisible: false,
    };
  },
  computed: {
    isEmission():boolean {
      return 'emission' === this.iFrameModel;
    },
    isLargeEmission():boolean {
      return 'largeEmission' === this.iFrameModel;
    },
    isLargeSuggestion():boolean {
      return 'largeSuggestion' === this.iFrameModel;
    },
    titleStillAvailable():string {
      if (this.isPodcastNotVisible) return this.$t('Podcast still available');
      return this.$t('Podcasts still available');
    },
    isLiveReadyToRecord():boolean {
      if (this.podcast)
        return (
          this.podcast.conferenceId &&
          0 !== this.podcast.conferenceId &&
          this.podcast.processingStatus === 'READY_TO_RECORD'
        );
      return false;
    },
    noAd() {
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
    authenticated():boolean {
      return state.generalParameters.authenticated;
    },
    iFrameSrc() {
      let url = [''];
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
            `${state.podcastPage.MiniplayerUri}miniplayer/emission/${this.emission.emissionId}${iFrameNumber}`
          );
        } else {
          url.push(
            `${state.podcastPage.MiniplayerUri}miniplayer/emissionLarge/${this.emission.emissionId}${iFrameNumber}`
          );
        }
      } else if (this.playlist) {
        if ('default' === this.iFrameModel) {
          url.push(
            `${state.podcastPage.MiniplayerUri}miniplayer/playlist/${this.playlist.playlistId}`
          );
        } else {
          url.push(
            `${state.podcastPage.MiniplayerUri}miniplayer/playlistLarge/${this.playlist.playlistId}`
          );
        }
      } else {
        if (this.isEmission || this.isLargeEmission) {
          url.push(
            `${state.podcastPage.MiniplayerUri}miniplayer/${this.iFrameModel}/${this.emission.emissionId}${iFrameNumber}/${this.podcast.podcastId}`
          );
        } else if (this.isLargeSuggestion) {
          url.push(
            `${state.podcastPage.MiniplayerUri}miniplayer/${this.iFrameModel}/${this.podcast.podcastId}${iFrameNumber}`
          );
        } else {
          url.push(
            `${state.podcastPage.MiniplayerUri}miniplayer/${this.iFrameModel}/${this.podcast.podcastId}`
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
      url.push('&time=' + this.startTime);
      if (this.isVisible) {
        url.push('&key=' + window.btoa(this.dataTitle));
      }
      return url.join('');
    },

    iFrameWidth() {
      return '100%';
    },

    iFrameHeight() {
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

    iFrame() {
      return `<iframe src="${this.iFrameSrc}" width="${this.iFrameWidth}" height="${this.iFrameHeight}" scrolling="no" frameborder="0"></iframe>`;
    },

    isPodcastNotVisible():boolean {
      return (
        this.podcast &&
        !this.podcast.availability.visibility &&
        ('default' === this.iFrameModel || 'large' === this.iFrameModel)
      );
    },

    dataTitle():any {
      if (this.podcast) return this.podcast.podcastId;
      if (this.emission) return this.emission.emissionId;
      return this.playlist.playlistId;
    },
  },

  methods: {
    async initColor() {
      if (!this.authenticated) return;
      let orgaId = undefined;
      if (this.podcast) {
        orgaId = this.podcast.organisation.id;
      } else if (this.playlist) {
        orgaId = this.playlist.organisation.id;
      } else {
        orgaId = this.emission.orga.id;
      }
      const data:any = await profileApi.fetchOrganisationAttibutes(
        this.$store,
        orgaId
      );
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
    },
    updateEpisodeNumber(value: string) {
      this.episodeNumbers = value;
    },
    updateProceedReading(value: boolean) {
      this.proceedReading = value;
    },
    updateIframeNumber(value: string) {
      this.iFrameNumber = value;
    },
    updateStartTime(value: number) {
      this.startTime = value;
    },
    updateIsVisible(value: boolean) {
      this.isVisible = value;
    },
  },
});
</script>
