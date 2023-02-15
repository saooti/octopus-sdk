import { Category } from '@/stores/class/general/category';
import { CommentPodcast } from '@/stores/class/general/comment';
import { defineStore } from 'pinia';

interface GeneralState{
  metaTitle: string;
  platformEducation: boolean;
  generalLogoUrl: string;
  storedCategories: Array<Category>;
  storedCategoriesOrga: Array<Category>;
  isBeforeLive: boolean;
  generalComments: {
    knownIdentity: string | null;
    actualPodcastId?: number;
    loadedComments: Array<CommentPodcast>;
    totalCount: number;
  };
}
export const useGeneralStore = defineStore('GeneralStore', {
  state: (): GeneralState => ({
    metaTitle: 'Octopus by Saooti',
    platformEducation:false,
    generalLogoUrl: '/img/logo_octopus_final.svg',
    storedCategories: [],
    storedCategoriesOrga: [],
    isBeforeLive: true,
    generalComments: {
      knownIdentity: null,
      actualPodcastId: 0,
      loadedComments: [],
      totalCount: 0,
    },
  }),
  actions:{
    storedUpdateCategories(categories: Array<Category>) {
      this.storedCategories = categories;
    },
    storedUpdateCategoriesOrga(categories: Array<Category>) {
      this.storedCategoriesOrga = categories;
    },
    isBeforeLiveUpdate(isBeforeLive: boolean) {
      this.isBeforeLive = isBeforeLive;
    },
    setCommentIdentity(identity:string|null) {
      this.generalComments.knownIdentity = identity;
    },
    setCommentLoaded(data: {podcastId?: number, comments:Array<CommentPodcast>}) {
      this.generalComments.actualPodcastId = data.podcastId;
      this.generalComments.loadedComments = data.comments;
    },
    platformUpdateEducation(isEducation: boolean) {
      this.platformEducation = isEducation;
      this.generalLogoUrl = '/img/logo_education.webp';
      this.metaTitle = 'RadioEducation.org';
    },
  }
})