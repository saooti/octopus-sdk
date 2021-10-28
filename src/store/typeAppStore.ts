import { Category } from "./class/category"
import { CommentPodcast } from "./class/comment"
import { Emission } from "./class/emission"
import { Media } from "./class/media"
import { Organisation } from "./class/organisation"
import { Player } from "./class/player"
import { Podcast } from "./class/podcast"
import { Rubriquage } from "./class/rubriquage"
import { RubriquageFilter } from "./class/rubriquageFilter"
import { Rubrique } from "./class/rubrique"
export function emptyEmissionData(): Emission{
  return {
      emissionId: 0 ,
      name: '' ,
      description: '' ,
      imageUrl: '' ,
      iabIds: undefined ,
      orga: {
        id: '',
        name: '',
        imageUrl: ''
      },
      rubriqueIds: [] ,
      monetisable: 'UNDEFINED',
  }
}

export function emptyPodcastData(): Podcast{
    return {
        podcastId:0,
        audioUrl: '' ,
        audioStorageUrl: '' ,
        imageUrl: '' ,
        animators: [] ,
        guests: [] ,
        emission: emptyEmissionData(),
        title: '' ,
        description: undefined ,
        tags: [] ,
        availability: {
          visibility: true,
          date: undefined ,
        },
        monetisable: 'UNDEFINED',
        comments: 'inherit',
        organisation: {
          id: '' ,
          name: '',
          imageUrl: '',
        },
        pubDate: undefined ,
        conferenceId: 0,
        duration: 0,
        annotations: {},
    }
  }

  
  export interface General {
    metaTitle: string;
    education: boolean;
    logoUrl: string;
  }

  export interface Authentication{
    isAuthenticated: boolean;
    name: string;
    organisationId: string | undefined;
    organisationName: string | undefined;
    role: Array<string>;
  }

  export interface Filter{
    organisationId: string | undefined;
    imgUrl: string | undefined;
    rubriquageArray: Array<Rubriquage>;
    rubriqueFilter: Array<RubriquageFilter>;
    rubriqueDisplay: Array<Rubrique>;
    typeMedia: string | undefined;
    sortOrder: string | undefined;
    sortField: string | undefined;
    live: boolean|undefined;
    iab: Category |undefined;
  }

  export interface StoreState{
    general: General;
    ui: {
        displayLeftMenu: boolean;
    };
    storage: {
      uri: string | undefined;
    };
    miniplayer: {
      uri: string | undefined;
    };
    player: Player;
  
    navigator: {
        isES6: boolean;
    };
  
    api: {
        uri: string | undefined;
    };
  
    RssApi: {
        uri: string | undefined;
    };
    MediaApi: {
        uri: string | undefined;
    };
    CommentApi: {
        uri: string | undefined;
    };
    studioApi: {
        uri: string | undefined;
    };
    processor: {
        uri: string | undefined;
    };
    rtmp: {
        uri: string | undefined;
    };
    frontend: {
        uri: string | undefined;
    };
    keycloakApi: {
        uri: string | undefined;
    };

    hlsApi: {
        uri: string | undefined;
    };
  
    authentication: Authentication;
  
    oAuthParam: {
        accessToken: string | undefined;
        refreshToken: string | undefined;
        accessTokenUri: string | undefined;
        clientId: string | undefined;
        expiration: number | undefined;
    };
    media: Media;
  
    profile: {
        firstname: string | undefined;
        lastname: string | undefined;
        email: string | undefined;
        userId: string | undefined;
        imageUrl: string | undefined;
        description: string | undefined;
        attributes: {[key: string]:string|number|boolean|undefined}|undefined;
    };
  
    organisation: Organisation;
    categories: Array<Category>;
    categoriesOrga: Array<Category>;
  
    filter: Filter;
  
      liveUpdate: {
        isBeforeLive: boolean;
      };
  
      uploadPodcastData: Podcast;
  
      comments: {
        knownIdentity: string|null;
        actualPodcastId: number;
        loadedComments: Array<CommentPodcast>;
        totalCount: number;
      };
  }

  export function AppStoreData(): StoreState{
    return {
        general: {
            metaTitle: 'Octopus by Saooti',
            education: false,
            logoUrl: '/img/logo_octopus.png',
          },
      
          ui: {
            displayLeftMenu: false,
          },
          storage: {
            uri: undefined ,
          },
          miniplayer: {
            uri: undefined ,
          },
          player: {
            status: 'STOPPED', //STOPPED, LOADING, PLAYING, PAUSED
            podcast: undefined ,
            volume: 1, //From 0 to 1
            elapsed: 0, //From 0 to 1
            total: 0,
            media: undefined ,
            live: undefined ,
            stop: undefined ,
          },
      
          navigator: {
            isES6: true,
          },
      
          api: {
            uri: undefined ,
          },
      
          RssApi: {
            uri: undefined ,
          },
          MediaApi: {
            uri: undefined ,
          },
          CommentApi: {
            uri: undefined ,
          },
          studioApi: {
            uri: undefined ,
          },
          processor: {
            uri: undefined ,
          },
          rtmp: {
            uri: undefined ,
          },
          frontend: {
            uri: undefined ,
          },
          keycloakApi:{
            uri:undefined,
          },
      
          hlsApi: {
            uri: undefined ,
          },
      
          authentication: {
            isAuthenticated: false,
            name: "",
            organisationId: undefined ,
            organisationName: undefined ,
            role: [""],
          },
      
          oAuthParam: {
            accessToken: undefined ,
            refreshToken: undefined ,
            accessTokenUri: undefined ,
            clientId: undefined ,
            expiration:undefined
          },
          media: {
            mediaId: 0,
            organisationId: '',
            title: '',
            audioUrl: ''
          },
      
          profile: {
            firstname: undefined ,
            lastname: undefined ,
            email: undefined ,
            userId: undefined ,
            imageUrl: undefined ,
            description: undefined ,
            attributes:undefined,
          },
      
          organisation: {
            id:'',
            name: '' ,
            imageUrl: '' ,
            description: undefined ,
            monetisable: undefined ,
            location: undefined ,
            comments: undefined ,
            attributes: {
              RSS_CONTACT: undefined ,
            },
          },
      
          categories: [] ,
      
          categoriesOrga: [] ,
      
          filter: {
            organisationId: undefined ,
            imgUrl: undefined ,
            rubriquageArray: [],
            rubriqueFilter: [],
            rubriqueDisplay:[],
            typeMedia: undefined ,
            sortOrder: undefined ,
            sortField: undefined ,
            live: false,
            iab: undefined,
          },
      
          liveUpdate: {
            isBeforeLive: true,
          },
      
          uploadPodcastData: emptyPodcastData(),
      
          comments: {
            knownIdentity: null,
            actualPodcastId: 0 ,
            loadedComments: [] ,
            totalCount:0 ,
          },
    }
  }