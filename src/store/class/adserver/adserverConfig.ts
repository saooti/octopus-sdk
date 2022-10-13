import { AdserverTiming } from "./adserverTiming";

export interface AdserverConfig {
  activeServer?: string; // SOUNDCAST, ADSWIZZ, TARGETSPOT
  config: {[key:string]:  Array<AdserverTiming>};
  minIntervalDuration?: number;
  minTailDuration?: number;
  soundcastDefaultSoundcastId?: string;
}
