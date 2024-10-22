export interface OpenAiParams {
  frequencyPenalty: number | null; // -2 -> 2
  presencePenalty: number | null; // -2 -> 2
  temperature: number | null; // 0-> 2
  promptKeyword: string | null;
  promptKeywordAndSummary: string | null;
  promptSummary: string | null;
  promptLinkedin: string | null;
  promptFacebook: string | null;
  promptX: string | null;
  preamble: string | null;
  postamble: string | null;
}
export interface OpenAiHistory {
  content: string;
  role: string; //user, assistant
}

export function emptyOpenAiParams(): OpenAiParams {
  return {
    frequencyPenalty: null,
    presencePenalty: null,
    temperature: null,
    postamble: null,
    preamble: null,
    promptFacebook: null,
    promptKeyword: null,
    promptKeywordAndSummary: null,
    promptLinkedin: null,
    promptSummary: null,
    promptX: null,
  };
}

export function getLimitBottom(key: string): number {
  if ("frequencyPenalty" === key || "presencePenalty" === key) {
    return -2;
  }
  return 0;
}
