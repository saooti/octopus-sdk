import { getLanguage } from "../../helper/language";
import { transcriptionApi, TranslationState, type PodcastTranslationData } from "../../api/transcriptionApi";
import { useAuthStore } from "../../stores/AuthStore";
import { CreateTranslation, defaultTranslationConfig, TranslationConfiguration } from "../../stores/class/transcript/transcriptParams";
import { podcastApi } from "../../api/podcastApi";
import { Emission } from "../../stores/class/general/emission";

const DEFAULT_LANGUAGE = 'en';

interface RelevantLanguages {
    /** Language which already has a generated translation */
    ready: string;
    /** Language that is more relevant but its translation is not yet generated */
    available?: string;
}

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
    function getTranslationConfig(language: string, emission?: Emission): CreateTranslation {
        const orgAttributes = authStore.authOrganisation.attributes;
        const emissionTranslation = parseOrDefault(emission?.annotations['translation-config'] as string|undefined, true);
        const orgTranslation = parseOrDefault(orgAttributes?.['translation-config']);

        return getConfigurationFor(language, emissionTranslation, orgTranslation);
    }

    /**
     * Get the relevant language for the current user
     * @param translationData The translation data for the podcast
     * @returns An object with properties 'ready' and 'available'
     *          - *ready* Is the best language already generated
     *          - *available* Is the best language not yet generated (or
     *                        undefined if *ready* is better)
     */
    async function getMostRelevantLanguage(translationData: PodcastTranslationData): Promise<RelevantLanguages> {
        const languages: RelevantLanguages = {
            ready: translationData.nativeLanguage
        };
        const baseLanguage = getLanguage();

        // 1. If language of podcast == language of browser, use that language
        if (baseLanguage === translationData.nativeLanguage) {
            languages.ready = baseLanguage;
        } else {
            const podcast = await podcastApi.get(translationData.podcastId);
            const emission = podcast.emission;

            const baseLangConfig = getTranslationConfig(baseLanguage, emission);
            const defaultLangConfig = getTranslationConfig(DEFAULT_LANGUAGE, emission);

            // 2. If the language of the browser is available, use it
            if (baseLangConfig === CreateTranslation.ALWAYS) {
                languages.ready = baseLanguage;
            }
            // 2b. If the language is on demand, check if generated
            else if (baseLangConfig === CreateTranslation.ON_DEMAND && !languages.available) {
                // Check if translation is already generated
                if (translationData.translations.find(t => t.language === baseLanguage && t.state === TranslationState.FINISHED)) {
                    languages.ready = baseLanguage;
                } else {
                    languages.available = baseLanguage;
                }
            }

            // 3. If default language is available, use it
            else if (defaultLangConfig === CreateTranslation.ALWAYS) {
                languages.ready = DEFAULT_LANGUAGE;
            }
            // 3b. If the language is on demand, it will be created
            else if (defaultLangConfig === CreateTranslation.ON_DEMAND && !languages.available) {
                // Check if translation is already generated
                if (translationData.translations.find(t => t.language === DEFAULT_LANGUAGE && t.state === TranslationState.FINISHED)) {
                    languages.ready = DEFAULT_LANGUAGE;
                } else {
                    languages.available = DEFAULT_LANGUAGE;
                }
            }

            // 4. Otherwise, use default language of podcast
            else {
                languages.ready = translationData.nativeLanguage;
            }
        }

        return languages;
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

        const { ready } = await getMostRelevantLanguage(translationData);

        // Finally get translation with chosen language
        const podcastId = translationData.podcastId;
        return await transcriptionApi.getTranslation(podcastId, ready);
    }

    return {
        convertSrtToPlainText,
        getMostRelevantLanguage,
        getMostRelevantTranslation,
        getTranslationConfig
    }
};
