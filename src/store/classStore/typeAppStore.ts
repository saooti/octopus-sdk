import { Category } from '../class/general/category';
import { CommentPodcast } from '../class/general/comment';
import { Rubriquage } from '../class/rubrique/rubriquage';
import { RubriquageFilter } from '../class/rubrique/rubriquageFilter';
import { Rubrique } from '../class/rubrique/rubrique';
import { ApiState } from './typeApiStore';
import { AuthState } from './typeAuthStore';
import { getDefaultPlayerState } from './typePlayerStore';
import { Player } from '../class/general/player';

export interface Filter{
  organisationId: string | undefined;
  imgUrl: string | undefined;
  name: string | undefined;
  rubriquageArray: Array<Rubriquage>;
  rubriqueFilter: Array<RubriquageFilter>;
  rubriqueDisplay: Array<Rubrique>;
  typeMedia: string | undefined;
  sortOrder: string | undefined;
  sortField: string | undefined;
  live: boolean|undefined;
  iab: Category |undefined;
}

export interface StoreState {
  general: {
    metaTitle: string;
    education: boolean;
    logoUrl: string;
  };
  categories: Array<Category>;
  categoriesOrga: Array<Category>;
  filter: Filter;
  liveUpdate: {
    isBeforeLive: boolean;
  };
  comments: {
    knownIdentity: string | null;
    actualPodcastId: number;
    loadedComments: Array<CommentPodcast>;
    totalCount: number;
  };
  player: Player;
  auth?: AuthState;
  api?: ApiState;
}

export function AppStoreData(): StoreState {
  return {
    general: {
      metaTitle: 'Octopus by Saooti',
      education: false,
      logoUrl: '/img/logo_octopus_final.svg',
    },
    categories: [],
    categoriesOrga: [],
    filter: {
      organisationId: undefined,
      imgUrl: undefined,
      name:undefined,
      rubriquageArray: [],
      rubriqueFilter: [],
      rubriqueDisplay: [],
      typeMedia: undefined,
      sortOrder: undefined,
      sortField: undefined,
      live: false,
      iab: undefined,
    },
    liveUpdate: {
      isBeforeLive: true,
    },
    comments: {
      knownIdentity: null,
      actualPodcastId: 0,
      loadedComments: [],
      totalCount: 0,
    },
    player: getDefaultPlayerState(),
  };
}
