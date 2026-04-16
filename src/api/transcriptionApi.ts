import { ModifyPodcastConfig } from "../stores/class/transcript/transcriptParams";
import { ModuleApi } from "./apiConnection";
import classicApi from "./classicApi";

/** State of the translation */
export enum TranslationState {
    /** Translation in progress */
    TRANSLATING = 'TRANSLATING',
    /** Translation is finished */
    FINISHED = 'FINISHED',
    /** Translation has failed */
    FAILED = 'FAILED',
    /** AI limit has exceeded during translation */
    AI_LIMIT_EXCEEDED = 'AI_LIMIT_EXCEEDED'
}

/** Data for one translation */
export interface TranslationData {
    /** Language of translation */
    language: string;
    /** State of the translation */
    state: TranslationState;
}

/** Translation data for one podcast. Contains data of all generated translations. */
export interface PodcastTranslationData {
    /** ID of the podcast */
    podcastId: number;
    /** Native language of the podcast */
    nativeLanguage: string;
    /** Translation data */
    translations: Array<TranslationData>;
}

interface TranslationProgress {
    started: boolean;
    percent: number;
}

/**
 * Returns the translations defined on the podcast
 * @param podcastId ID of the podcast
 * @returns Promise containing the translation data for the podcast
 */
async function getTranslations(podcastId: number): Promise<PodcastTranslationData> {
    return classicApi.fetchData<PodcastTranslationData>({
        api: ModuleApi.SPEECHTOTEXT,
        path: `transcription/${podcastId}/languages`
    });
}

/**
 * Returns the translation in a given language for the podcast
 * @param podcastId ID of the podcast
 * @param language The target language
 * @param mayCreate *(optional)* If set to true, request creation if not available
 * @returns The transcription
 */
async function getTranslation(podcastId: number, language: string, mayCreate?: boolean): Promise<string> {
    let path = `transcription/${podcastId}/languages/${language}/srt`;
    if (mayCreate !== undefined) {
        path = `${path}?mayCreateIfNotExists=${mayCreate}`;
    }

    let found = false;
    let timeout = 1000;
    const timeoutStep = 100;
    while (!found) {
        const result = await classicApi.fetchData<string|TranslationProgress>({
            api: ModuleApi.SPEECHTOTEXT,
            path
        });

        // Stop when we get the proper result
        if (typeof result === 'string') {
            found = true;
            return result;
        }

        // Wait some time before retrying
        await new Promise((resolve) => setTimeout(resolve, timeout));
        timeout += timeoutStep;

        if (timeout >= 60 * 1000) {
            break;
        }
    }

    throw new Error('Timeout lors de la récupération de la transcription');
}

/**
 * Get raw transcription for the given podcast
 * @param podcastId ID of the podcast
 * @returns The raw transcript
 */
async function getRawTranscription(podcastId: number): Promise<string> {
    return classicApi.fetchData({
        api: ModuleApi.SPEECHTOTEXT,
        path: `transcription/text/${podcastId}`,
    });
}

/**
 * Generate the transcription on the given podcast
 * @param podcastId ID of the podcast on which to do the transcription
 * @param langauge Target language. Should be the native language of the podcast
 * @param params Transcription parameters
 */
async function generateTranscription(podcastId: number, language: string, params: ModifyPodcastConfig): Promise<void> {
    await classicApi.postData({
        api: ModuleApi.SPEECHTOTEXT,
        path: `convert/${language}/${podcastId}`,
        dataToSend: params
    });
}

/**
 * Regenerate the transcription on the given podcast
 * Currently does the same as `generateTranscription`, but should be used when
 * relevant in case of future evolutions.
 * @param podcastId ID of the podcast on which to do the transcription
 * @param langauge Target language. Should be the native language of the podcast
 * @param params Transcription parameters
 */
async function regenerateTranscription(podcastId: number, language: string, params: ModifyPodcastConfig): Promise<void> {
    await classicApi.putData({
        api: ModuleApi.SPEECHTOTEXT,
        path: `regenerate/${language}/${podcastId}`,
        dataToSend: params
    });
}

/**
 * Change the visibility of the podcast
 * @param podcastId ID of the podcast for which to change the visibility
 * @param visibility New visibility state
 */
async function changeTranscriptionVisibility(podcastId: number, visibility: boolean): Promise<void> {
    await classicApi.putData({
        api: 11,
        path: "visibility/" + podcastId,
        parameters: {
            visibility
        }
    });
}

/**
 * Update the transcription of a podcast
 * @param podcastId ID of the podcast
 * @param transcript The new transcript
 */
async function updateTranscription(podcastId: number, transcript: string): Promise<void> {
    await classicApi.postData({
        api: ModuleApi.SPEECHTOTEXT,
        path: "update/" + podcastId,
        dataToSend: {
            file: new File([transcript], "file")
        },
        contentType: "formData"
    });
}

export const transcriptionApi = {
    changeTranscriptionVisibility,
    getTranslations,
    getTranslation,
    getRawTranscription,
    generateTranscription,
    regenerateTranscription,
    updateTranscription
};
