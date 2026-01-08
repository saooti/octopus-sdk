import { Person } from "../user/person";

export type OrganisationAttributes = {
  [key: string]: string | number | boolean | undefined;
  /** The URL to the podcastmaker of the organisation */
  podcastmakerUrl?: string;
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
