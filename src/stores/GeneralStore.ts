import { Category } from "@/stores/class/general/category";
import { defineStore } from "pinia";
import { Podcast } from "./class/general/podcast";
import { Emission } from "./class/general/emission";
import { Playlist } from "./class/general/playlist";
import { Canal } from "./class/radio/canal";

interface GeneralState {
  metaTitle: string;
  platformEducation: boolean;
  generalLogoUrl: string;
  storedCategories: Array<Category>;
  storedCategoriesOrga: Array<Category>;
  isBeforeLive: boolean;
  consentTcf: string | null;
  contentToDisplay: Podcast | Emission | Playlist | Canal | null;
}
export const useGeneralStore = defineStore("GeneralStore", {
  state: (): GeneralState => ({
    metaTitle: "Octopus by Saooti",
    platformEducation: false,
    generalLogoUrl: "/img/logo_saooti_play_black.webp",
    storedCategories: [],
    storedCategoriesOrga: [],
    isBeforeLive: true,
    consentTcf: null,
    contentToDisplay: null,
  }),
  actions: {
    contentToDisplayUpdate(
      contentToDisplay: Podcast | Emission | Playlist | Canal | null,
    ) {
      this.contentToDisplay = contentToDisplay;
    },
    storedUpdateCategories(categories: Array<Category>) {
      this.storedCategories = categories;
    },
    storedUpdateCategoriesOrga(categories: Array<Category>) {
      this.storedCategoriesOrga = categories;
    },
    isBeforeLiveUpdate(isBeforeLive: boolean) {
      this.isBeforeLive = isBeforeLive;
    },
    consentTcfUpdate(consentTcf: string | null) {
      this.consentTcf = consentTcf;
    },
    platformUpdateEducation(isEducation: boolean) {
      this.platformEducation = isEducation;
      if (isEducation) {
        this.generalLogoUrl = "/img/logo_education.webp";
        this.metaTitle = "RadioEducation.org";
      }
    },
    metaTitleUpdate(title: string) {
      this.metaTitle = title;
    },

  },
});
