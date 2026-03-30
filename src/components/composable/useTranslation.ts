import { getLanguage } from "../../helper/language";
import { transcriptionApi, type PodcastTranslationData } from "../../api/transcriptionApi";
import { useAuthStore } from "../../stores/AuthStore";
import { CreateTranslation, defaultTranslationConfig, TranslationConfiguration } from "../../stores/class/transcript/transcriptParams";
import { podcastApi } from "../../api/podcastApi";
import { Emission } from "../../stores/class/general/emission";

const DEFAULT_LANGUAGE = 'en';

export const useTranslation = () => {

    const authStore = useAuthStore();

    /**
     * Convert SRT data to plain text
     * @param srt The data to convert
     * @returns The plain text
     */
    function convertSrtToPlainText(srt: string): string {
        const srtPattern =
            /\d+\n[\d:,]+\s+-{2}>\s+[\d:,]+\n([\s\S]*?(?=\n{2}|$))/gm;
        const result: Array<string> = [];
        let matches: string[];
        while ((matches = srtPattern.exec(srt)) != null) {
            result.push(matches[1] + " ");
        }
        return result.join("");
    }

    function getApplicationConf(language: string, conf: TranslationConfiguration): CreateTranslation {
        if (language in conf.createTranslation) {
            return conf.createTranslation[language];
        }

        return conf.otherLanguage;
    }

    /**
     * Retrieve the translation configuration for a given language
     */
    function getConfigurationFor(language: string, emissionConf: TranslationConfiguration, orgaConf: TranslationConfiguration): CreateTranslation {
        const emissionSetting = getApplicationConf(language, emissionConf);
        if (emissionSetting === CreateTranslation.SUPER) {
            return getApplicationConf(language, orgaConf);
        }
        return emissionSetting;
    }

    function parseOrDefault(data: string|undefined, isEmission = false): TranslationConfiguration {
        return data ? JSON.parse(data) : defaultTranslationConfig(isEmission);
    }

    /**
     * Indicates wether the language is available (either because generated or
     * because it can be generated)
     * @param language The language to check for
     * @param emission *(optional)* If set, will also check in emission settings
     * @returns Whether the language is available or not
     */
    function isLanguageAvailable(language: string, emission?: Emission): boolean {
        const orgAttributes = authStore.authOrganisation.attributes;
        const emissionTranslation = parseOrDefault(emission?.annotations['translation-config'] as string|undefined, true);
        const orgTranslation = parseOrDefault(orgAttributes?.['translation-config']);

        const translation = getConfigurationFor(language, emissionTranslation, orgTranslation);
        return [CreateTranslation.ALWAYS, CreateTranslation.ON_DEMAND].includes(translation);
    }

    /**
     * Get the relevant language for the current user
     * @param translationData The translation data for the podcast
     * @returns The language
     */
    async function getMostRelevantLanguage(translationData: PodcastTranslationData): Promise<string> {
        const baseLanguage = getLanguage();

        // 1. If language of podcast == language of browser, use that language
        if (baseLanguage === translationData.nativeLanguage) {
            return baseLanguage;
        }

        const podcast = await podcastApi.get(translationData.podcastId);
        const emission = podcast.emission;
        
        // 2. If the language of the browser is available, use it
        // 2b. If the language is on demand, it will be created
        if (isLanguageAvailable(baseLanguage, emission)) {
            return baseLanguage;
        }

        // 3. If default language is available, use it
        // 3b. If the language is on demand, it will be created
        if (isLanguageAvailable(DEFAULT_LANGUAGE, emission)) {
            return DEFAULT_LANGUAGE;
        }

        // 4. Otherwise, use default language of podcast
        return translationData.nativeLanguage;
    }

    /**
     * Get the relevant translation for the current user
     * @param translationData The translation data for the podcast
     * @returns The translation
     */
    async function getMostRelevantTranslation(translationData: PodcastTranslationData): Promise<string>;
    /**
     * Get the relevant translation for the current user
     * @param podcastId The ID of the podcast
     * @returns The translation
     */
    async function getMostRelevantTranslation(podcastId: number): Promise<string>;

    /**
     * Get the relevant translation for the current user
     * @param translationData The translation data for the podcast
     * @returns The translation
     */
    async function getMostRelevantTranslation(data: PodcastTranslationData|number): Promise<string> {
        let translationData: PodcastTranslationData;
        if (typeof data === 'number') {
            translationData = await transcriptionApi.getTranslations(data);
        } else {
            translationData = data;
        }

        const targetLanguage = await getMostRelevantLanguage(translationData);

        // Finally get translation with chosen language
        const podcastId = translationData.podcastId;
        return await transcriptionApi.getTranslation(podcastId, targetLanguage, true);
    }

    return {
        convertSrtToPlainText,
        getMostRelevantLanguage,
        getMostRelevantTranslation
    }
};
