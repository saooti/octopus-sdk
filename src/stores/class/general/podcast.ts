import { Emission, emptyEmissionData } from "./emission";
import { Organisation } from "./organisation";
import { Participant } from "./participant";
import { Person } from "../user/person";
export interface Podcast {
  imageUrl?: string;
  animators?: Array<Participant>;
  annotations?: { [key: string]: string | number | boolean | undefined };
  audioStorageUrl: string;
  audioUrl: string;
  article?: string;
  availability: {
    date?: number | null;
    visibility?: boolean;
    immediate?: boolean;
  };
  comments?: string;
  conferenceId?: number;
  createdAt?: string;
  valid?: boolean;
  description?: string;
  downloadCount?: number;
  duration: number;
  email?: string;
  emission: Emission;
  guests?: Array<Participant>;
  monetisable?: string;
  organisation: Organisation;
  podcastId: number;
  processingStatus?: string;
  processorId?: string;
  pubDate?: string;
  publisher?: Person;
  rubriqueIds?: Array<number>;
  score?: number;
  size?: number;
  tags?: Array<string>;
  ofTags?: Array<string>;
  title: string;
  weekDownloadCount?: number;
  order?: number;
}
export function emptyPodcastData(): Podcast {
  return {
    podcastId: 0,
    audioUrl: "",
    audioStorageUrl: "",
    article: "",
    imageUrl: "",
    animators: [],
    guests: [],
    emission: emptyEmissionData(),
    title: "",
    description: undefined,
    tags: [],
    availability: {
      visibility: true,
      date: undefined,
    },
    monetisable: "UNDEFINED",
    comments: "inherit",
    organisation: {
      id: "",
      name: "",
      imageUrl: "",
    },
    pubDate: undefined,
    conferenceId: 0,
    duration: 0,
  };
}
