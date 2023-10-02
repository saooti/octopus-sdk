import { Organisation } from "@/stores/class/general/organisation";
import { Profile } from "@/stores/class/user/profile";
import { defineStore } from "pinia";

interface AuthState {
  authName: string;
  authOrgaId?: string;
  authOrgaName?: string;
  authRole: Array<string>;
  authParam: {
    accessToken?: string;
    refreshToken?: string;
    expiration?: Date;
  };
  authProfile?: Profile;
  authOrganisation: Organisation;
}
export const useAuthStore = defineStore("AuthStore", {
  state: (): AuthState => ({
    authName: "",
    authRole: [""],
    authParam: {
      accessToken: undefined,
      refreshToken: undefined,
      expiration: undefined,
    },
    authProfile: undefined,
    authOrganisation: {
      id: "",
      name: "",
      imageUrl: "",
      description: undefined,
      monetisable: undefined,
      location: undefined,
      comments: undefined,
      attributes: {
        RSS_CONTACT: undefined,
      },
    },
  }),
  getters: {
    isGarRole(): string | undefined {
      return this.authProfile?.attributes?.["GAR"] as
        | string
        | undefined; /*CHEF_ETABLISSEMENT, ENSEIGNANT, ELEVE, undefined */
    },
    isGarStudent(): boolean {
      return "ELEVE" === this.isGarRole;
    },
  },
});
