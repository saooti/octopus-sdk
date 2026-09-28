import { AdserverTiming } from "./adserverTiming";

export enum AdServerType {
    SOUNDCAST = 'SOUNDCAST',
    SOUNDCAST_VAST = 'SOUNDCAST_VAST',
    TARGETSPOT = 'TARGETSPOT',
    // #14727
    ADSWIZZ = 'ADSWIZZ'
}

export interface AdserverConfig {
    activeServer?: AdServerType;
    config: { [key: string]: Array<AdserverTiming> };
    minIntervalDuration?: number;
    minTailDuration?: number;
    soundcastDefaultSoundcastId?: string;
}
