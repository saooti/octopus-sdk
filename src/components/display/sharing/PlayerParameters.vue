<template>
  <div
    id="accordionParameters"
    class="accordion player-parameters mt-3"
  >
    <div class="accordion-item">
      <h2
        id="labelPlayerParameter"
        class="accordion-header mb-0"
      >
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#playerParameters"
          aria-expanded="false"
          aria-controls="playerParameters"
        >
          {{ $t('player parameters') }}
        </button>
      </h2>
      <div
        id="playerParameters"
        class="accordion-collapse collapse"
        aria-labelledby="labelPlayerParameter"
        data-bs-parent="#accordionParameters"
      >
        <div class="accordion-body">
          <div
            v-if="choseNumberEpisode"
            class="d-flex flex-column flex-grow"
          >
            <div
              v-if="displayChoiceAllEpisodes"
              class="d-flex align-items-center w-100 flex-wrap mt-1"
            >
              <input
                v-model="episodeNumbers"
                class="form-check-input"
                type="radio"
                name="episodeNumbers"
                value="all"
              >
              <span class="flex-shrink">{{ $t('Show every episode') }}</span>
            </div>
            <div
              class="d-flex align-items-center flex-wrap"
              :class="displayChoiceAllEpisodes ? '' : 'mt-3'"
            >
              <input
                v-if="displayChoiceAllEpisodes"
                v-model="episodeNumbers"
                class="form-check-input"
                type="radio"
                name="episodeNumbers"
                value="number"
              >
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
            <div>
              <input
                id="proceedCheck"
                v-model="proceedReading"
                type="checkbox"
                class="form-check-input"
              >
              <label
                class="form-check-label"
                for="proceedCheck"
              >{{
                $t('Proceed reading')
              }}</label>
            </div>
            <div>
              <input
                id="isVisibleCheckbox"
                v-model="isVisibleTemp"
                type="checkbox"
                class="form-check-input"
              >
              <label
                class="form-check-label me-2"
                for="isVisibleCheckbox"
              >{{ $t('Podcasts still available') }}</label>
            </div>
          </div>
          <div
            v-else
            class="d-flex flex-column flex-grow"
          >
            <div>
              <input
                id="proceedCheck"
                v-model="displayArticle"
                type="checkbox"
                class="form-check-input"
              >
              <label
                class="form-check-label"
                for="proceedCheck"
              >{{
                $t('Display associated article')
              }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    isVisible: { default: false, type: Boolean},
    choseNumberEpisode: {default: false, type: Boolean},
    displayChoiceAllEpisodes: {default: false, type: Boolean}
  },
  emits: ['episodeNumbers', 'proceedReading', 'isVisible', 'iFrameNumber', 'displayArticle'],

  data() {
    return {
      proceedReading: true as boolean,
      episodeNumbers: 'number' as string,
      iFrameNumberPriv: '3' as string,
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