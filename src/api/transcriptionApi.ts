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
 * @returns The transcription
 */
async function getTranslation(podcastId: number, language: string): Promise<string> {
    return classicApi.fetchData<string>({
        api: ModuleApi.SPEECHTOTEXT,
        path: `transcription/${podcastId}/languages/${language}/srt`
    });
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

export const transcriptionApi = {
    convertSrtToPlainText,
    getTranslations,
    getTranslation,
    getRawTranscription
};
