import { Category } from '@/stores/class/general/category';
import { defineStore } from 'pinia';

interface GeneralState{
  metaTitle: string;
  platformEducation: boolean;
  generalLogoUrl: string;
  storedCategories: Array<Category>;
  storedCategoriesOrga: Array<Category>;
  isBeforeLive: boolean;
}
export const useGeneralStore = defineStore('GeneralStore', {
  state: (): GeneralState => ({
    metaTitle: 'Octopus by Saooti',
    platformEducation:false,
    generalLogoUrl: '/img/logo_octopus_final.svg',
    storedCategories: [],
    storedCategoriesOrga: [],
    isBeforeLive: true,
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
    platformUpdateEducation(isEducation: boolean) {
      this.platformEducation = isEducation;
      if(isEducation){
        this.generalLogoUrl = '/img/logo_education.webp';
        this.metaTitle = 'RadioEducation.org';
      }
    },
  }
})