<template>
  <div class="h4 mb-2 mt-3">
    {{ $t("player parameters") }}
  </div>
  <template v-if="choseNumberEpisode">
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
      />
      <span class="flex-shrink-0">{{ $t("Show every episode") }}</span>
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
      />
      <span class="flex-shrink-0">{{ $t("Show") }}</span>
      <input
        id="number-input"
        v-model="iFrameNumber"
        type="number"
        min="1"
        max="50"
        class="input-share-player text-center m-2"
      />
      <label for="number-input" :title="$t('Number of player podcasts')" />
      <span class="flex-shrink-0">{{ $t("Last podcasts") }}</span>
    </div>
    <ClassicCheckbox
      :text-init="proceedReading"
      @update:text-init="$emit('update:proceedReading', $event)"
      id-checkbox="proceed-reading-checkbox"
      :label="$t('Proceed reading')"
    />
    <ClassicCheckbox
      :text-init="isVisible"
      @update:text-init="$emit('update:isVisible', $event)"
      id-checkbox="is-visible-checkbox"
      :label="$t('Podcasts still available')"
    />
  </template>
  <ClassicCheckbox
    v-if="displayArticleParam"
    :text-init="displayArticle"
    @update:text-init="$emit('update:displayArticle', $event)"
    id-checkbox="display-article-checkbox"
    :label="$t('Display associated article')"
  />
  <ClassicCheckbox
    v-if="displayTranscriptParam"
    :text-init="displayTranscript"
    @update:text-init="$emit('update:displayTranscript', $event)"
    id-checkbox="display-transcript-checkbox"
    :label="$t('If the transcript is available, show it')"
  />
  <ClassicCheckbox
    v-if="displayWaveParam"
    :text-init="displayWave"
    @update:text-init="$emit('update:displayWave', $event)"
    id-checkbox="display-wave-checkbox"
    :label="$t('Show animated wave')"
  />
  <ClassicCheckbox
    :text-init="playerAutoPlay"
    @update:text-init="$emit('update:playerAutoPlay', $event)"
    id-checkbox="player-autoplay-checkbox"
    :label="$t('Trigger automatic reading if this is possible')"
  />
</template>

<script lang="ts">
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    ClassicCheckbox,
  },
  props: {
    isVisible: { default: false, type: Boolean },
    choseNumberEpisode: { default: false, type: Boolean },
    displayWaveParam: { default: true, type: Boolean },
    displayChoiceAllEpisodes: { default: false, type: Boolean },
    displayTranscriptParam: { default: false, type: Boolean },
    displayArticleParam: { default: false, type: Boolean },
    proceedReading: { default: true, type: Boolean },
    displayArticle: { default: true, type: Boolean },
    displayTranscript: { default: true, type: Boolean },
    displayWave: { default: true, type: Boolean },
    playerAutoPlay: { default: false, type: Boolean },
  },
  emits: [
    "episodeNumbers",
    "update:proceedReading",
    "update:isVisible",
    "iFrameNumber",
    "update:displayArticle",
    "update:displayTranscript",
    "update:displayWave",
    "update:playerAutoPlay"
  ],

  data() {
    return {
      episodeNumbers: "number" as string,
      iFrameNumberPriv: "3" as string,
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
      this.$emit("episodeNumbers", this.episodeNumbers);
    },
    iFrameNumberPriv(): void {
      this.$emit("iFrameNumber", this.iFrameNumberPriv);
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  .input-share-player {
    border: 1px solid #ddd;
    border-radius: 50px;
    width: 60px;
  }
}
</style>
