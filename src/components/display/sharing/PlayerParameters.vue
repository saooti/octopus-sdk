<template>
  <b-card
    v-if="!playlist"
    no-body
    class="player-parameters mt-3"
  >
    <div role="tablist">
      <b-card-header
        header-tag="header"
        role="tab"
      >
        <b-button
          v-b-toggle.playerParameters
          block
          variant="info"
        >
          {{
            $t('player parameters')
          }}
        </b-button>
      </b-card-header>
    </div>
    <b-collapse
      id="playerParameters"
      role="tabpanel"
    >
      <b-card-body>
        <b-card-text>
          <div
            v-if="
              !podcast || isEmission || isLargeEmission || isLargeSuggestion
            "
            class="d-flex flex-column flex-grow"
          >
            <div
              v-if="!podcast || isEmission || isLargeEmission"
              class="d-flex align-items-center w-100 flex-wrap mt-1"
            >
              <b-form-radio
                v-model="episodeNumbers"
                name="episodeNumbers"
                value="all"
              />
              <span class="flex-shrink">{{ $t('Show every episode') }}</span>
            </div>
            <div
              class="d-flex align-items-center flex-wrap"
              :class="!podcast || isEmission || isLargeEmission ? '' : 'mt-3'"
            >
              <b-form-radio
                v-if="!podcast || isEmission || isLargeEmission"
                v-model="episodeNumbers"
                name="episodeNumbers"
                value="number"
              />
              <span class="flex-shrink">{{ $t('Show') }}</span>
              <input
                id="number-input"
                v-model="iFrameNumber"
                type="number"
                min="1"
                max="50"
                class="input-share-player input-no-outline text-center m-2"
              >
              <label
                for="number-input"
                class="d-inline"
                :aria-label="$t('Number of player podcasts')"
              />
              <span class="flex-shrink">{{ $t('Last podcasts') }}</span>
            </div>
            <div class="checkbox-saooti">
              <input
                id="proceedCheck"
                v-model="proceedReading"
                type="checkbox"
                class="custom-control-input"
              >
              <label
                class="custom-control-label"
                for="proceedCheck"
              >{{
                $t('Proceed reading')
              }}</label>
            </div>
            <div class="checkbox-saooti">
              <input
                id="isVisibleCheckbox"
                v-model="isVisibleTemp"
                type="checkbox"
                class="custom-control-input"
              >
              <label
                class="custom-control-label mr-2"
                for="isVisibleCheckbox"
              >{{ $t('Podcasts still available') }}</label>
            </div>
          </div>
          <div
            v-else
            class="d-flex flex-column flex-grow"
          >
            <div class="checkbox-saooti">
              <input
                id="proceedCheck"
                v-model="displayArticle"
                type="checkbox"
                class="custom-control-input"
              >
              <label
                class="custom-control-label"
                for="proceedCheck"
              >{{
                $t('Display associated article')
              }}</label>
            </div>
          </div>
          <!-- <div class="d-flex align-items-center flex-wrap" v-if="podcast && iFrameModel !== 'emission'">
              <div class="checkbox-saooti">  
                <input type="checkbox" class="custom-control-input" id="startTime" v-model="startTime">  
                <label class="custom-control-label mr-2" for="startTime">{{$t('Start at')}}</label>  
              </div>
                <input 
                ref="minutesRef"
                type="number"
                :value="minutes" 
                min="0"
                class="input-share-player input-no-outline" 
                @change="onDurationChange"/>
                <div class="mr-1 ml-1">:</div>
              <input 
                ref="secondesRef"
                type="number"
                :value="secondes" 
                min="0"
                max="59"
                class="input-share-player input-no-outline" 
                @change="onDurationChange"/>
            </div> -->
        </b-card-text>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script lang="ts">
import { Playlist } from '@/store/class/playlist';
import { Podcast } from '@/store/class/podcast';
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    podcast: { default: undefined, type: Object as ()=> Podcast},
    playlist: { default: undefined, type: Object as ()=> Playlist},
    iFrameModel: { default: undefined, type: String},
    isVisible: { default: false, type: Boolean},
  },
  emits: ['startTime', 'episodeNumbers', 'proceedReading', 'isVisible', 'iFrameNumber', 'displayArticle'],

  data() {
    return {
      proceedReading: true as boolean,
      episodeNumbers: 'number' as string,
      iFrameNumberPriv: '3' as string,
      minutes: 0 as number,
      secondes: 0 as number,
      startTime: true as boolean,
      isVisibleTemp: this.isVisible as boolean,
      displayArticle: true as boolean,
    };
  },
  computed: {
    iFrameNumber: {
      get(): string {
        return this.iFrameNumberPriv;
      },
      set(value: string) {
        const val = parseInt(value, 10);
        if (!isNaN(val) && val >= 1 && val <= 50) {
          this.iFrameNumberPriv = value;
        }
      },
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
  },
  watch: {
    episodeNumbers(): void {
      this.$emit('episodeNumbers', this.episodeNumbers);
    },
    proceedReading(): void {
      this.$emit('proceedReading', this.proceedReading);
    },
    isVisibleTemp(): void {
      this.$emit('isVisible', this.isVisibleTemp);
    },
    isVisible(): void {
      this.isVisibleTemp = this.isVisible;
    },
    iFrameNumberPriv(): void {
      this.$emit('iFrameNumber', this.iFrameNumberPriv);
    },
    displayArticle(): void{
      this.$emit('displayArticle', this.displayArticle);
    }
  },
  methods: {
    onDurationChange(): void {
      if (this.startTime) {
        const minutes = parseInt((this.$refs.minutesRef as any).value, 10);
        const secondes = parseInt((this.$refs.secondesRef as any).value, 10);
        this.$emit('startTime', minutes * 60 + secondes);
      } else {
        this.$emit('startTime', 0);
      }
    },
  },
})
</script>

<style lang="scss">
.player-parameters.card {
  border: 0;
  .btn {
    border-radius: 0;
  }
  .card-header {
    border: 0;
    background-color: #fafafa;
    padding: 0;
  }
  .card-body {
    padding: 0.25rem;
    border: 0.05rem solid #eee;
    background-color: #fafafa;
    .custom-control {
      padding-left: 0;
    }
    input[type='number'] {
      padding-left: 10px;
      text-align: center;
      width: 90px;
    }
  }
}
</style>