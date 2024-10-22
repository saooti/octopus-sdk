import { ExternalRtmpUrl } from "./conference";

export interface LiveParameters {
  videoProfile: string;
  externalRtmpUrl?: ExternalRtmpUrl;
}
export function emptyLiveParameters(): LiveParameters {
  return {
    videoProfile: "no_video",
  };
}
