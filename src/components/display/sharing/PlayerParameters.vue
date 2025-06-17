<template>
  <fieldset class="mt-3">
    <legend class="h4 mb-2 mt-3">
      {{ t("player parameters") }}
    </legend>
    <template v-if="choseNumberEpisode">
      <div v-if="displayChoiceAllEpisodes" role="radiogroup">
        <div
          class="d-flex align-items-center flex-wrap mt-1"
        >
          <input
            id="radio-all-episodes"
            v-model="episodeChoiceDisplay"
            class="form-check-input"
            type="radio"
            name="episodeNumbers"
            value="all"
          />
          <label for="radio-all-episodes" class="flex-shrink-0">{{
            t("Show every episode")
          }}</label>
        </div>
        <div
          class="d-flex align-items-center flex-wrap"
        >
          <input
            v-if="displayChoiceAllEpisodes"
            v-model="episodeChoiceDisplay"
            class="form-check-input"
            type="radio"
            name="episodeNumbers"
            value="number"
            :title="t('Show') + ' ' + t('Last podcasts')"
          />
          <ChooseEpisodesNumber :episodes-number="episodesNumber" @update-number="emit('update:episodesNumber', $event)"/>
        </div>
      </div>
      <ChooseEpisodesNumber v-else :episodes-number="episodesNumber" @update-number="emit('update:episodesNumber', $event)"/>
      <ClassicCheckbox
        :text-init="proceedReading"
        id-checkbox="proceed-reading-checkbox"
        :label="t('Proceed reading')"
        @update:text-init="emit('update:proceedReading', $event)"
      />
    </template>
    <ClassicCheckbox
      v-if="displayIsVisible"
      :text-init="isVisible"
      id-checkbox="is-visible-checkbox"
      :label="titleStillAvailable"
      @update:text-init="emit('update:isVisible', $event)"
    />
    <ClassicCheckbox
      v-if="displayArticleParam"
      :text-init="displayArticle"
      id-checkbox="display-article-checkbox"
      :label="t('Display associated article')"
      @update:text-init="emit('update:displayArticle', $event)"
    />
    <ClassicCheckbox
      v-if="displayTranscriptParam"
      :text-init="displayTranscript"
      id-checkbox="display-transcript-checkbox"
      :label="t('If the transcript is available, show it')"
      @update:text-init="emit('update:displayTranscript', $event)"
    />
    <ClassicCheckbox
      v-if="displayWaveParam"
      :text-init="displayWave"
      id-checkbox="display-wave-checkbox"
      :label="t('Show animated wave')"
      @update:text-init="emit('update:displayWave', $event)"
    />
    <ClassicCheckbox
      :text-init="playerAutoPlay"
      id-checkbox="player-autoplay-checkbox"
      :label="t('Trigger automatic reading if this is possible')"
      @update:text-init="emit('update:playerAutoPlay', $event)"
    />
    <PlayerCommonParameters
      v-if="displayInsertCode"
      :insert-code="insertCode"
      @update:insert-code="emit('update:insertCode', $event)"
    />
  </fieldset>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";
import { computed, defineAsyncComponent, ref, watch } from "vue";
const ChooseEpisodesNumber = defineAsyncComponent(() => import("./ChooseEpisodesNumber.vue"));
const PlayerCommonParameters = defineAsyncComponent(
  () => import("./PlayerCommonParameters.vue"),
);

//Props 
const props = defineProps({
  isVisible: { default: false, type: Boolean },
  choseNumberEpisode: { default: false, type: Boolean },
  displayWaveParam: { default: true, type: Boolean },
  displayChoiceAllEpisodes: { default: false, type: Boolean },
  displayTranscriptParam: { default: false, type: Boolean },
  displayArticleParam: { default: false, type: Boolean },
  displayIsVisible: { default: false, type: Boolean },
  displayInsertCode: { default: false, type: Boolean },
  proceedReading: { default: true, type: Boolean },
  displayArticle: { default: true, type: Boolean },
  displayTranscript: { default: true, type: Boolean },
  displayWave: { default: true, type: Boolean },
  playerAutoPlay: { default: false, type: Boolean },
  isPodcastNotVisible: { default: false, type: Boolean },
  episodesNumber: { default: 3, type: Number },
  insertCode: { default: false, type: Boolean },
})


//Emits
const emit = defineEmits([
  "episodeChoiceDisplay",
  "update:proceedReading",
  "update:isVisible",
  "update:episodesNumber",
  "update:displayArticle",
  "update:displayTranscript",
  "update:displayWave",
  "update:playerAutoPlay",
  "update:insertCode"]);


//Data 
const episodeChoiceDisplay = ref("number");

//Composables
const { t } = useI18n();

//Computed
const titleStillAvailable = computed(() =>{
  return props.isPodcastNotVisible ? t("Podcast still available"): t("Podcasts still available");
});

//Watch
watch(episodeChoiceDisplay, async () => {
  emit("episodeChoiceDisplay", episodeChoiceDisplay.value);
});

</script>