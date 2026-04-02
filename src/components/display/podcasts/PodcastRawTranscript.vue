<template>
    <div>
        <AccessibilityModal
            v-if="isAccessibilityModal"
            @save="saveAccessibility"
            @close="isAccessibilityModal = false"
        />
        <div class="transcription-section-buttons">
            <button
                v-if="isOpen"
                class="btn btn-primary m-0"
                @click="isAccessibilityModal = true"
            >
                <EyeOutlineIcon class="me-1" /> {{ t('Transcript Accessibility') }}
            </button>

            <div
                v-if="isOpen && availableLanguagesOptions.length > 0"
                class="language-selector"
            >
                <span class="me-2">{{ t('Transcript - Available languages') }}</span>
                <ClassicSelect
                    :text-init="currentLanguage"
                    :is-disabled="!loadingDone"
                    :options="availableLanguagesOptions"
                    :display-label="false"
                    @update:text-init="changeLanguage"
                />
            </div>
            
            <button
                class="btn btn-transcript"
                :class="{ open: isOpen }"
                @click="isOpen = !isOpen"
            >
                {{ buttonText }}
            </button>
        </div>
        <div v-if="isOpen" class="transcription-body">
            <ClassicLoading
                :loading-text="!loadingDone ? t('Loading content ...') : undefined"
            />
            <div class="transcription-text">
                <template v-if="loadingDone && transcript?.length">
                    {{ transcript }}
                </template>
                <template v-if="loadingDone && !transcript?.length">
                    {{ t("Transcript does not yet exist for this episode") }}
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import cookiesHelper from "../../../helper/cookiesHelper";
import EyeOutlineIcon from "vue-material-design-icons/EyeOutline.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { transcriptionApi, TranslationState } from "../../../api/transcriptionApi";
import { useTranslation } from "../../composable/useTranslation";
import ClassicSelect from "../../form/ClassicSelect.vue";
const AccessibilityModal = defineAsyncComponent(
    () => import("../accessibility/AccessibilityModal.vue"),
);

//Props 
const props = defineProps<{
    /** ID of the podcast for which to display transcription */
    podcastId: number;
}>();

//Data 
const isOpen = ref(false);
const loadingDone = ref(false);
const isAccessibilityModal = ref(false);
const transcript = ref<string|undefined>(undefined);
/** Native language of the podcast */
const nativeLanguage = ref('');
/** List of languages for which a transcription exists */
const availableLanguages = ref<Array<string>>([]);
/** Currently shown language */
const currentLanguage = ref('');

//Composables
const { t } = useI18n();
const { convertSrtToPlainText, getMostRelevantLanguage } = useTranslation();

//Computed
const buttonText = computed(() => isOpen.value? t("Hide transcript"): t("View transcript"));

const availableLanguagesOptions = computed(() => {
    return availableLanguages.value.map(lang => ({
        title: lang,
        value: lang
    }));
})

//Watch
watch(isOpen, () => {
    if (isOpen.value && !loadingDone.value) {
        if (props.podcastId) {
            fetchTranscripts();
        }
        getAccessibility();
    }
});

//Methods
function getAccessibility(){
    const fontSize = cookiesHelper.getCookie("octopus-font-size");
    if (null !== fontSize) {
        setCssProperty('--octopus-accessibility-font-size', fontSize);
    }
    const background = cookiesHelper.getCookie("octopus-background");
    if (null !== background) {
        setCssProperty('--octopus-accessibility-background', background);
    }
    const color = cookiesHelper.getCookie("octopus-color");
    if (null !== color) {
        setCssProperty('--octopus-accessibility-color', color);
    }
}

function setCssProperty(name: string, value: string){
    document.documentElement.style.setProperty(name,value);
}

function saveAccessibility(accessibility: {fontSize: number,background: string,color: string}){
    setCssProperty('--octopus-accessibility-font-size', accessibility.fontSize+'px');
    cookiesHelper.setCookie("octopus-font-size", accessibility.fontSize+'px');
    setCssProperty('--octopus-accessibility-background', accessibility.background);
    cookiesHelper.setCookie("octopus-background",accessibility.background);
    setCssProperty('--octopus-accessibility-color', accessibility.color);
    cookiesHelper.setCookie("octopus-color",accessibility.color);
    isAccessibilityModal.value = false;
}

async function fetchTranscripts(language?: string): Promise<void> {
    try {
        const translation = await transcriptionApi.getTranslations(props.podcastId);
        if (language === undefined) {
            const { ready, available } = await getMostRelevantLanguage(translation);
            // If available language is set, it is better than ready, so use it
            language = available ?? ready;
        }
        const srt = await transcriptionApi.getTranslation(props.podcastId, language, true);
        transcript.value = convertSrtToPlainText(srt);
        
        availableLanguages.value = translation.translations
            .filter(t => t.state === TranslationState.FINISHED)
            .map(t => t.language);
        nativeLanguage.value = translation.nativeLanguage;
        currentLanguage.value = language;
        availableLanguages.value.unshift(translation.nativeLanguage);

        if (!availableLanguages.value.includes(language)) {
            availableLanguages.value.push(language);
        }
    } catch (error) {
        console.error(error);
    }
    loadingDone.value = true;
}

async function changeLanguage(language: string): Promise<void> {
    loadingDone.value = false;
    currentLanguage.value = language;
    transcript.value = undefined;
    try {
        const srt = await transcriptionApi.getTranslation(props.podcastId, language);        
        transcript.value = convertSrtToPlainText(srt);
    } catch (error) {
        console.error(error);
    }
    loadingDone.value = true;
}

/** Force reloading */
function reset(): void {
    if (isOpen.value || loadingDone.value) {
        fetchTranscripts(currentLanguage.value);
    }
}

defineExpose({ reset });
</script>

<style scoped lang="scss">
.octopus-app {
  --octopus-accessibility-font-size: 16px;
  --octopus-accessibility-background: var(--octopus-background);
  --octopus-accessibility-color: var(--octopus-color-text);

  .language-selector {
    display: flex;
    align-items: center;
    margin-left: 1rem;

    span {
        font-weight: 600;
    }
  }

  .transcription-section-buttons{
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    @media (width <= 625px) {
      flex-direction: column;
    }
  }
  .btn-transcript {
    position: relative;
    border-radius: var(--octopus-border-radius);
    overflow: hidden;
    background: var(--octopus-secondary);
    transition: all 0.2s linear 0s;
    
    &.open{
      margin-left:auto;
      direction: rtl;
      @media (width <= 625px) {
        margin-top: 0.5rem;
      }
    }
    &:not(.open){
      margin-right: auto;
    }

    &:not(.open)::before,
    &.open::after {
      content: "➤";
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      height: 100%;
      width: 30px;
      border-radius: 0 50% 50% 0;
      background-color: var(--octopus-background-transparent);
      transform: scale(0, 1);
      transition: all 0.2s linear 0s;
    }

    &:not(.open)::before {
      left: 0;
      transform-origin: left center;
    }

    &.open::after {
      right: -30px;
      transform-origin: center left;
    }
    &:hover {
      text-indent: 30px;
    }

    &:not(.open):hover::before,
    &.open:hover::after {
      text-indent: 0;
    }

    &:not(.open):hover::before {
      transform: scale(1, 1);
    }

    &.open:hover::after {
      transform: scale(-1, 1);
    }
  }

  .transcription-body {
    font-size: var(--octopus-accessibility-font-size);
    position: relative;
    padding: 1rem;
    max-height: 250px;
    display: flex;
    justify-content: center;
    white-space: pre-wrap;
    background: var(--octopus-accessibility-background);
    color: var(--octopus-accessibility-color);
    border: 2px solid var(--octopus-border-default);
    border-radius: var(--octopus-border-radius);

    .transcription-text {
      overflow: hidden auto;
    }
  }
}
</style>
