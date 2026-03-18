import { AdserverConfig } from "../adserver/adserverConfig";
import { emptyOrganisationData, Organisation } from "./organisation";
import { Person } from "../user/person";
import { ItuneCategory } from "./ituneCategory";
import { Annotations } from ".";

/**
 * Season settings for emissions
 */
export enum SeasonMode {
  /** This emission doesn't have seasons */
  NO_SEASON = 'NO_SEASON',
  /** This emission has seasons and episodes are ordered by date */
  SEASON_WITHOUT_PODCAST_NUMBERING = 'SEASON_WITHOUT_PODCAST_NUMBERING',
  /** This emission has seasons and episodes are ordered manually */
  SEASON_WITH_PODCAST_NUMBERING = 'SEASON_WITH_PODCAST_NUMBERING'
}

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
  /** Seasons configuration */
  seasonMode: SeasonMode;
  /** Number of seasons on this emission */
  seasonCount: number;
  /** Indicates that the emission has explicit content */
  explicit?: boolean;
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
    seasonMode: SeasonMode.NO_SEASON,
    seasonCount: 0
  };
}
