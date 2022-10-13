<template>
  <div
    id="accordionParameters"
    class="accordion mt-3"
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
        titleledby="labelPlayerParameter"
        data-bs-parent="#accordionParameters"
      >
        <div class="accordion-body">
          <div
            v-if="choseNumberEpisode"
            class="d-flex flex-column flex-grow-1"
          >
            <div
              v-if="displayChoiceAllEpisodes"
              class="d-flex align-items-center flex-wrap mt-1"
            >
              <input
                v-model="episodeNumbers"
                class="form-check-input"
                type="radio"
                name="episodeNumbers"
                value="all"
              >
              <span class="flex-shrink-0">{{ $t('Show every episode') }}</span>
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
              <span class="flex-shrink-0">{{ $t('Show') }}</span>
              <input
                id="number-input"
                v-model="iFrameNumber"
                type="number"
                min="1"
                max="50"
                class="input-share-player  text-center m-2"
              >
              <label
                for="number-input"
                :title="$t('Number of player podcasts')"
              />
              <span class="flex-shrink-0">{{ $t('Last podcasts') }}</span>
            </div>
            <ClassicCheckbox
              v-model:textInit="proceedReading"
              id-checkbox="proceed-reading-checkbox"
              :label="$t('Proceed reading')"
            />
            <ClassicCheckbox
              v-model:textInit="isVisibleTemp"
              id-checkbox="is-visible-checkbox"
              :label="$t('Podcasts still available')"
            />
          </div>
          <div
            v-if="displayArticleParam"
            class="d-flex flex-column flex-grow-1"
          >
            <ClassicCheckbox
              v-model:textInit="displayArticle"
              id-checkbox="display-article-checkbox"
              :label="$t('Display associated article')"
            />
          </div>
          <div 
            v-if="displayTranscriptParam"
            class="d-flex flex-column flex-grow-1"
          >
            <ClassicCheckbox
              v-model:textInit="displayTranscript"
              id-checkbox="display-transcript-checkbox"
              :label="$t('If the transcript is available, show it')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ClassicCheckbox from '../../form/ClassicCheckbox.vue';
import { defineComponent } from 'vue'
export default defineComponent({
  components:{
    ClassicCheckbox,
  },
  props: {
    isVisible: { default: false, type: Boolean},
    choseNumberEpisode: {default: false, type: Boolean},
    displayChoiceAllEpisodes: {default: false, type: Boolean},
    displayTranscriptParam: {default: false, type: Boolean},
    displayArticleParam: {default: false, type: Boolean},
  },
  emits: ['episodeNumbers', 'proceedReading', 'isVisible', 'iFrameNumber', 'displayArticle', 'displayTranscript'],

  data() {
    return {
      proceedReading: true as boolean,
      episodeNumbers: 'number' as string,
      iFrameNumberPriv: '3' as string,
      isVisibleTemp: this.isVisible,
      displayArticle: true as boolean,
      displayTranscript:true as boolean,
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
    },
    displayTranscript(): void{
      this.$emit('displayTranscript', this.displayTranscript);
    }
  },
})
</script>

<style lang="scss">
.octopus-app{
  .input-share-player {
    border: 1px solid #ddd;
    border-radius: 50px;
    width: 60px;
  }
}
</style>