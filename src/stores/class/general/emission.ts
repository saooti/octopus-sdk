import { AdserverConfig } from "../adserver/adserverConfig";
import { Organisation } from "./organisation";
import { Person } from "../user/person";

export interface Emission {
  imageUrl?: string;
  annotations?: { [key: string]: string | number | boolean | undefined };
  description: string;
  emissionId: number;
  iabIds?: Array<number>;
  lastPodcastDate?: string;
  monetisable: string;
  name: string;
  orga: Organisation;
  rubriqueIds: Array<number>;
  score?: number;
  publisher?: Person;
  copyright?: string;
  optItunesCategories?: Array<string>;
  adConfigs?: { [key: string]: AdserverConfig };
  urlFeed?: string;
}

export function emptyEmissionData(): Emission {
  return {
    emissionId: 0,
    name: "",
    description: "",
    imageUrl: "",
    iabIds: undefined,
    orga: {
      id: "",
      name: "",
      imageUrl: "",
    },
    rubriqueIds: [],
    monetisable: "UNDEFINED",
  };
}
