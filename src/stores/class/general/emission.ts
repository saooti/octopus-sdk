import { AdserverConfig } from "../adserver/adserverConfig";
import { Organisation } from "./organisation";
import { Person } from "../user/person";
import { ItuneCategory } from "./ituneCategory";

export interface Emission {
  imageUrl?: string;
  annotations?: { [key: string]: string | number | boolean | undefined };
  beneficiaries: string[];
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
  optItunesCategories?: Array<ItuneCategory>;
  adConfigs?: { [key: string]: AdserverConfig };
  urlFeed?: string;
  limits?: {
    podcastMaxAge?: number;
    podcastMaxCount?: number;
  };
  createdByUserId?: string;
  privateRssType?:string;
  /**
   * Indicates that this emission and its episode are visible.
   * *Default: true*
   */
  visible?: boolean;
  /** An optional list of tags */
  tags?: string[];
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
    limits: {},
  };
}
