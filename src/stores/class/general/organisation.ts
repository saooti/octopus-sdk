import { Person } from "../user/person";

export type OrganisationAttributes = {
  //[key: string]: string | number | boolean | undefined;
  automation?: string;
  /** JSON */
  'modify-podcast'?: string;
  /** The URL to the podcastmaker of the organisation */
  podcastmakerUrl?: string;
  /** Text to speech parameters (JSON) */
  ttsParams?: string;
  /** Translation parameters (JSON) */
  'translation-config'?: string;
};

export interface Organisation {
  imageUrl: string;
  admin?: Person;
  comments?: string;
  attributes?: OrganisationAttributes;
  description?: string;
  id: string;
  location?: {
    longitude: number;
    latitude: number;
  };
  monetisable?: string;
  name: string;
  notSeenOnKeycloak?: number;
  score?: number;
  privacy?: string;
}

export function emptyOrganisationData(): Organisation {
  return {
    imageUrl: "",
    id: "",
    name: ""
  };
}
export function emptyOrgaData(defaultName: string): Organisation {
  return {
    imageUrl: "/img/emptypodcast.webp",
    id: "",
    name: defaultName
  };
}
