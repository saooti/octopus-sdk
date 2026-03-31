export interface TranscriptParams {
  automation: string; // super, {date}, false 
  ttsParams: TtsParams;
  modifyPodcast: ModifyPodcastConfig
  translationConfig: TranslationConfiguration;
}
export interface TtsParams {
  super: string;
  style: string;
  pitch: number;
  speed: number;
  voice: string;
  language: string;
}

export interface ModifyPodcastConfig {
  modifyChaptering: ModifyPodcastEnum;
  modifyKeywords: ModifyPodcastEnum;
  modifyDescription: ModifyPodcastEnum;
  createDescriptionUsingAi: boolean;
  wordsNumber: number;
}

export enum ModifyPodcastEnum {
  SUPER = "SUPER",
  NO = "NO",
  IF_EMPTY = "IF_EMPTY",
  OVERWRITE="OVERWRITE"
}

export interface TranslationConfiguration {
  createTranslation:{[lang:string]: CreateTranslation};
  otherLanguage:CreateTranslation; //Cannot be ALWAYS
}

export enum CreateTranslation {
  NEVER = "NEVER",
  ON_DEMAND = "ON_DEMAND",
  ALWAYS = "ALWAYS",
  SUPER="SUPER"
}

export function defaultTtsParams(): TtsParams {
  return {
    super: "true",
    style: "neutral",
    pitch: 0,
    speed: 1,
    voice: "",
    language: ""
  };
}

export function defaultModifyPodcastConfig(): ModifyPodcastConfig {
  return {
    modifyChaptering: ModifyPodcastEnum.NO,
    modifyKeywords:ModifyPodcastEnum.NO,
    modifyDescription:ModifyPodcastEnum.NO,
    createDescriptionUsingAi: false,
    wordsNumber: 100,
  };
}

/**
 * Create a default object of TranslationConfiguration
 * @param isEmission Optional, if set and true changes default values
 * @returns The object
 */
export function defaultTranslationConfig(isEmission?: boolean): TranslationConfiguration {
  return {
    createTranslation:{},
    otherLanguage: isEmission ? CreateTranslation.SUPER : CreateTranslation.NEVER
  };
}

export interface Voice {
  name: string;
  locale: string;
  displayName: string;
  gender: string;
  audioExample?: string;
  styles?: [];
  provider: string;
}
export interface ProviderTts {
  name: string;
  fullName: string;
  logoPath: string;
  description: string;
}
