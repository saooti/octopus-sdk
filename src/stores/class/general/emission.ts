import { AdserverConfig } from "../adserver/adserverConfig";
import { emptyOrganisationData, Organisation } from "./organisation";
import { Person } from "../user/person";
import { ItuneCategory } from "./ituneCategory";
import { Annotations } from ".";

/**
 * An emission
 */
export interface Emission {
  imageUrl?: string;
  annotations?: Annotations;
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
  /** The ids of groups this emission belongs to */
  groupIds?: Array<number>
}

export function emptyEmissionData(orga?: Organisation): Emission {
  return {
    emissionId: 0,
    name: "",
    description: "",
    imageUrl: "",
    iabIds: undefined,
    orga: orga ?? emptyOrganisationData(),
    beneficiaries: [],
    rubriqueIds: [],
    monetisable: "UNDEFINED",
    limits: {},
  };
}
