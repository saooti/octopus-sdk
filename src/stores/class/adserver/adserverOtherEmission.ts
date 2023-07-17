import { AdserverTiming } from "./adserverTiming";
import { Organisation } from "../general/organisation";

export interface AdserverOtherEmission {
  config: {
    doublets: Array<AdserverTiming>;
    minIntervalDuration: number;
    minTailDuration: number;
    server: string;
  };
  elected: string;
  organisation: Organisation;
}
