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
        audioUrl: undefined as any,
        imageUrl: undefined as any,
        animators: [] as any,
        guests: [] as any,
        emission: {
        emissionId: undefined as any,
        name: undefined as any,
        description: undefined as any,
        imageUrl: undefined as any,
        iabIds: undefined as any,
        orga: {
            id: undefined as any,
        },
        rubriqueIds: [] as any,
        monetisable: 'UNDEFINED',
        },
        title: undefined as any,
        description: undefined as any,
        tags: [] as any,
        availability: {
        visibility: true,
        date: undefined as any,
        },
        email: undefined as any,
        processorId: undefined as any,
        monetisable: 'UNDEFINED',
        comments: 'inherit',
        organisation: {
            id: undefined as any,
        },
        saveOrganisationRubriquage: undefined as any,
        pubDate: undefined as any,
        conferenceId: 0,
        duration: 0,
        annotations: {},
    }
  }

  export function emptyEmissionData(): Emission{
    return {
        emissionId: undefined as any,
        name: undefined as any,
        description: undefined as any,
        imageUrl: undefined as any,
        iabIds: undefined as any,
        orga: {
        id: undefined as any,
        },
        rubriqueIds: [] as any,
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
        totalCount: any,
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
            uri: undefined as any,
          },
          miniplayer: {
            uri: undefined as any,
          },
          player: {
            status: 'STOPPED', //STOPPED, LOADING, PLAYING, PAUSED
            podcast: undefined as any,
            volume: 1, //From 0 to 1
            elapsed: 0, //From 0 to 1
            total: 0,
            media: undefined as any,
            live: undefined as any,
            stop: undefined as any,
          },
      
          navigator: {
            isIE11: undefined as any,
            isES6: true,
          },
      
          api: {
            uri: undefined as any,
          },
      
          RssApi: {
            uri: undefined as any,
          },
          MediaApi: {
            uri: undefined as any,
          },
          CommentApi: {
            uri: undefined as any,
          },
          studioApi: {
            uri: undefined as any,
          },
          processor: {
            uri: undefined as any,
          },
          rtmp: {
            uri: undefined as any,
          },
          frontend: {
            uri: undefined as any,
          },
          keycloakApi:{
            uri:undefined,
          },
      
          hlsApi: {
            uri: undefined as any,
          },
      
          authentication: {
            isAuthenticated: false,
            name: "",
            organisationId: undefined as any,
            organisationName: undefined as any,
            role: [""],
          },
      
          oAuthParam: {
            accessToken: undefined as any,
            refreshToken: undefined as any,
            accessTokenUri: undefined as any,
            clientId: undefined as any,
            expiration:undefined
          },
          media: {
            file: undefined as any,
            organisationId: undefined as any,
            titre: undefined as any,
            annee: undefined as any,
            type: undefined as any,
            artiste: undefined as any,
            album: undefined as any,
          },
      
          profile: {
            firstname: undefined as any,
            lastname: undefined as any,
            email: undefined as any,
            userId: undefined as any,
            imageUrl: undefined as any,
            description: undefined as any,
            attributes:undefined,
          },
      
          organisation: {
              id:undefined,
            name: undefined as any,
            imageUrl: undefined as any,
            description: undefined as any,
            monetisable: undefined as any,
            location: undefined as any,
            comments: undefined as any,
            attributes: {
              RSS_CONTACT: undefined as any,
            },
            SOUNDCAST_IDENTIFIER: undefined as any,
            SEPA: undefined as any,
            SIRET: undefined as any,
          },
      
          categories: [] as any,
      
          categoriesOrga: [] as any,
      
          filter: {
            organisationId: undefined as any,
            imgUrl: undefined as any,
            typeMedia: undefined as any,
            sortOrder: undefined as any,
            sortField: undefined as any,
            live: false,
          },
      
          liveUpdate: {
            isBeforeLive: true,
          },
      
          uploadPodcastData: emptyPodcastData(),
      
          comments: {
            knownIdentity: null,
            actualPodcastId: undefined as any,
            loadedComments: [] as any,
            totalCount:undefined as any,
          },
    }
  }