import { Organisation } from "./organisation";
import { Person } from "../user/person";
import { FetchParam } from "./fetchParam";
import { Annotations } from ".";
import { ItuneCategory } from "./ituneCategory";

export interface Playlist {
  ambianceType?: string; //#11919 "NONE", "AMBIANCE", "PROGRAMMED"
  imageUrl?: string;
  description: string;
  organisation?: Organisation;
  playlistId: number;
  podcasts?: Array<number | undefined>;
  score: number;
  title: string;
  type: string;
  samplingViews?: Array<PlaylistRule>;
  publisher?: Person;
  /** The annotations of the playlist */
  annotations?: Annotations;
  copyright?: string;
  optItunesCategories?: Array<ItuneCategory>;
}

export function emptyPlaylistData(): Playlist {
  return {
    ambianceType: "NONE",
    description: "",
    playlistId: 0,
    podcasts: undefined,
    score: 0,
    title: "",
    type: "DYNAMIC",
    samplingViews: [],
  };
}

export interface PlaylistRule {
  maxSize: number;
  podcastId?: number;
  query?: FetchParam;
  type?: string;
  title?: string;
}

export function emptyPlaylistRule(): PlaylistRule {
  return {
    maxSize: 1,
    query: {},
    title: undefined,
  };
}
