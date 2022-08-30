import { Organisation } from '../general/organisation';
import { Person } from '../user/person';
import { FetchParam } from './fetchParam';


export interface Playlist {
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
}

export interface PlaylistRule {
  maxSize: number,
  podcastId?: number,
  query?: FetchParam,
  type?:string,
  title?: string,
}

export function emptyPlaylistRule(): PlaylistRule{
  return {
    maxSize: 1,
    query: {},
    title: undefined,
  }
}
