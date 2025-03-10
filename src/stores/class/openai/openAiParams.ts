export interface OpenAiParams {
  promptLinkedin: string | null;
  promptFacebook: string | null;
  promptX: string | null;
  preamble: string | null;
  postamble: string | null;
  summaryMaxWordNumbers: number|null;
  maxChapters: number|null;
  chapterMinSeconds: number|null;
}
export interface OpenAiHistory {
  content: string;
  role: string; //user, assistant
}

export function emptyOpenAiParams(): OpenAiParams {
  return {
    postamble: null,
    preamble: null,
    promptFacebook: null,
    promptLinkedin: null,
    promptX: null,
    summaryMaxWordNumbers: null,
    maxChapters: null,
    chapterMinSeconds: null
  };
}
