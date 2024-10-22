export interface TranscriptParams {
  automation: string;
  wordsNumber: number;
  modifyDescription: string;
  isWordsNumber: boolean;
  openAiBehavior: string; //no, keywords, description, descriptionAndKeywords
  ttsParams: { [key: string]: string | number | undefined };
}

export function defaultTranscriptParams(
  automation: string,
  modifyDescription?: string,
): TranscriptParams {
  return {
    automation: automation,
    wordsNumber: 100,
    modifyDescription: modifyDescription ?? "NO",
    isWordsNumber: true,
    openAiBehavior: "no",
    ttsParams: {},
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
