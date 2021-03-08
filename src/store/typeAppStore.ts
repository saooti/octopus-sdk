export interface Emission{
    emissionId: number|undefined,
    name: string | undefined,
    description: string | undefined,
    imageUrl: string | undefined,
    iabIds: any,
    orga: Organisation,
    rubriqueIds: any,
    monetisable: string,
    annotations?:any
}
export interface Organisation {
    id: string | undefined,
    name?: string | undefined,
    imageUrl?: string | undefined,
    description?: string | undefined,
    monetisable?: string | undefined,
    location?: any,
    comments?: string | undefined,
    attributes?: any,
    SOUNDCAST_IDENTIFIER?: string | undefined,
    SEPA?: string | undefined,
    SIRET?: string | undefined,
}
export interface Podcast{
    podcastId:number,
    audioUrl: string | undefined,
    imageUrl: string | undefined,
    animators: any,
    guests: any,
    emission: Emission,
    title: string | undefined,
    description: string |undefined,
    tags: any,
    availability: any,
    email: string | undefined,
    processorId: string | undefined,
    monetisable: string,
    comments: string,
    organisation: Organisation,
    saveOrganisationRubriquage: any,
    pubDate: string | undefined,
    conferenceId: number,
    duration: number,
    annotations: any,
    createdAt?: any,
    rubriqueIds?:any,
}
export function emptyPodcastData(): Podcast{
    return {
        podcastId:0,
        audioUrl: undefined,
        imageUrl: undefined,
        animators: [],
        guests: [],
        emission: {
        emissionId: undefined,
        name: undefined,
        description: undefined,
        imageUrl: undefined,
        iabIds: undefined,
        orga: {
            id: undefined,
        },
        rubriqueIds: [],
        monetisable: 'UNDEFINED',
        },
        title: undefined,
        description: undefined,
        tags: [],
        availability: {
        visibility: true,
        date: undefined,
        },
        email: undefined,
        processorId: undefined,
        monetisable: 'UNDEFINED',
        comments: 'inherit',
        organisation: {
            id: undefined,
        },
        saveOrganisationRubriquage: undefined,
        pubDate: undefined,
        conferenceId: 0,
        duration: 0,
        annotations: {},
    }
  }

  export function emptyEmissionData(): Emission{
    return {
        emissionId: undefined,
        name: undefined,
        description: undefined,
        imageUrl: undefined,
        iabIds: undefined,
        orga: {
        id: undefined,
        },
        rubriqueIds: [],
        monetisable: 'UNDEFINED',
    }
  }
  export interface General {
    metaTitle: string,
    education: Boolean,
    logoUrl: string,
  }

  export interface Player{
    status: string, //STOPPED, LOADING, PLAYING, PAUSED
    podcast: any,
    volume?: number, //From 0 to 1
    elapsed?: number, //From 0 to 1
    total?: number,
    media: any,
    live: any,
    stop?: any,
  }

  export interface Authentication{
    isAuthenticated: Boolean,
    name: string,
    organisationId: string | undefined,
    organisationName: string | undefined,
    role: Array<string>,
  }
  export interface Media{
    file: any,
    organisationId: string | undefined,
    titre: string | undefined,
    annee: string | undefined,
    type: string | undefined,
    artiste: string | undefined,
    album: string | undefined,
  }

  export interface Filter{
    organisationId: string | undefined,
    imgUrl: string | undefined,
    typeMedia: string | undefined,
    sortOrder: string | undefined,
    sortField: string | undefined,
    live: any,
  }

  export interface StoreState{
    general: General,
    ui: {
        displayLeftMenu: boolean,
    },
    storage: {
      uri: string | undefined,
    },
    miniplayer: {
      uri: string | undefined,
    },
    player: Player,
  
    navigator: {
        isIE11: Boolean | undefined,
        isES6: Boolean,
    },
  
    api: {
        uri: string | undefined,
    },
  
    RssApi: {
        uri: string | undefined,
    },
    MediaApi: {
        uri: string | undefined,
    },
    CommentApi: {
        uri: string | undefined,
    },
    studioApi: {
        uri: string | undefined,
    },
    processor: {
        uri: string | undefined,
    },
    rtmp: {
        uri: string | undefined,
    },
    frontend: {
        uri: string | undefined,
    },
    keycloakApi:{
        uri:string | undefined,
    },

    hlsApi: {
        uri: string | undefined,
    },
  
    authentication: Authentication,
  
    oAuthParam: {
        accessToken: string | undefined,
        refreshToken: string | undefined,
        accessTokenUri: string | undefined,
        clientId: string | undefined,
        expiration:any,
    },
    media: Media,
  
    profile: {
        firstname: any,
        lastname: any,
        email: any,
        userId: any,
        imageUrl: any,
        description: any,
        attributes:any,
    },
  
    organisation: Organisation,
    categories: any,
    categoriesOrga: any,
  
    filter: Filter,
  
      liveUpdate: {
        isBeforeLive: Boolean,
      },
  
      uploadPodcastData: Podcast,
  
      comments: {
        knownIdentity: any,
        actualPodcastId: number | undefined,
        loadedComments: any,
      },
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
            uri: undefined,
          },
          miniplayer: {
            uri: undefined,
          },
          player: {
            status: 'STOPPED', //STOPPED, LOADING, PLAYING, PAUSED
            podcast: undefined,
            volume: 1, //From 0 to 1
            elapsed: 0, //From 0 to 1
            total: 0,
            media: undefined,
            live: undefined,
            stop: undefined,
          },
      
          navigator: {
            isIE11: undefined,
            isES6: true,
          },
      
          api: {
            uri: undefined,
          },
      
          RssApi: {
            uri: undefined,
          },
          MediaApi: {
            uri: undefined,
          },
          CommentApi: {
            uri: undefined,
          },
          studioApi: {
            uri: undefined,
          },
          processor: {
            uri: undefined,
          },
          rtmp: {
            uri: undefined,
          },
          frontend: {
            uri: undefined,
          },
          keycloakApi:{
            uri:undefined,
          },
      
          hlsApi: {
            uri: undefined,
          },
      
          authentication: {
            isAuthenticated: false,
            name: "",
            organisationId: undefined,
            organisationName: undefined,
            role: [""],
          },
      
          oAuthParam: {
            accessToken: undefined,
            refreshToken: undefined,
            accessTokenUri: undefined,
            clientId: undefined,
            expiration:undefined
          },
          media: {
            file: undefined,
            organisationId: undefined,
            titre: undefined,
            annee: undefined,
            type: undefined,
            artiste: undefined,
            album: undefined,
          },
      
          profile: {
            firstname: undefined,
            lastname: undefined,
            email: undefined,
            userId: undefined,
            imageUrl: undefined,
            description: undefined,
            attributes:undefined,
          },
      
          organisation: {
              id:undefined,
            name: undefined,
            imageUrl: undefined,
            description: undefined,
            monetisable: undefined,
            location: undefined,
            comments: undefined,
            attributes: {
              RSS_CONTACT: undefined,
            },
            SOUNDCAST_IDENTIFIER: undefined,
            SEPA: undefined,
            SIRET: undefined,
          },
      
          categories: [],
      
          categoriesOrga: [],
      
          filter: {
            organisationId: undefined,
            imgUrl: undefined,
            typeMedia: undefined,
            sortOrder: undefined,
            sortField: undefined,
            live: false,
          },
      
          liveUpdate: {
            isBeforeLive: true,
          },
      
          uploadPodcastData: emptyPodcastData(),
      
          comments: {
            knownIdentity: null,
            actualPodcastId: undefined,
            loadedComments: [],
          },
    }
  }