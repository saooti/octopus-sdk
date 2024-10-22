import { AdserverTiming } from "./adserverTiming";

export interface AdserverConfig {
  activeServer?: string; // SOUNDCAST, TARGETSPOT, SOUNDCAST_VAST
  config: { [key: string]: Array<AdserverTiming> };
  minIntervalDuration?: number;
  minTailDuration?: number;
  soundcastDefaultSoundcastId?: string;
}
