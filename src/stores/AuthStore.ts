import { Organisation } from "@/stores/class/general/organisation";
import { Profile } from "@/stores/class/user/profile";
import { useSaveFetchStore } from "./SaveFetchStore";
import { defineStore } from "pinia";
import { KeycloakInfo } from "@/stores/class/user/person";
//import "@/css/generalAdmin.scss"; TODO
import { VideoConfig } from "@/stores/class/config/videoConfig";
import classicApi from "../api/classicApi";

interface AuthState {
  authReload: number;
  authName: string;
  authOrgaId?: string;
  authOrgaName?: string;
  authRole: Array<string>;
  authParam: {
    accessToken?: string;
    refreshToken?: string;
    expiration?: Date;
    clientId?: string;
  };
  authProfile?: Profile;
  authOrganisation: Organisation;
  authVideoConfig: VideoConfig;
}
export const useAuthStore = defineStore("AuthStore", {
  state: (): AuthState => ({
    authReload: 0,
    authName: "",
    authRole: [],
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
    authVideoConfig: { active: false },
  }),
  getters: {
    isRoleAdmin(): boolean {
      return this.authRole.includes("ADMIN");
    },
    isRoleAnimator(): boolean {
      return this.authRole.includes("ANIMATION");
    },
    isRoleUsers(): boolean {
      return this.authRole.includes("USERS");
    },
    isRoleOrganisation(): boolean {
      return this.authRole.includes("ORGANISATION");
    },
    isRoleProduction(): boolean {
      return this.authRole.includes("PRODUCTION");
    },
    isRolePublication(): boolean {
      return this.authRole.includes("PODCAST_VALIDATION");
    },
    isRoleContribution(): boolean {
      return this.authRole.includes("PODCAST_CRUD");
    },
    isRolePlaylists(): boolean {
      return this.authRole.includes("PLAYLISTS");
    },
    isRoleComments(): boolean {
      return this.authRole.includes("COMMENTS_MODERATION");
    },
    isRoleEditor(): boolean {
      return this.authRole.includes("EDITION");
    },
    isRoleAnalytics(): boolean {
      return this.authRole.includes("ANALYTICS");
    },
    isRoleAdvertising(): boolean {
      return this.authRole.includes("ADVERTISING");
    },
    isRoleLive(): boolean {
      return this.authRole.includes("LIVE");
    },
    isRoleRadio(): boolean {
      return this.authRole.includes("RADIO");
    },
    isRoleBillingAdmin(): boolean {
      return this.authRole.includes("BILLING_ADMIN");
    },
    isRoleBillingViewer(): boolean {
      return this.authRole.includes("BILLING_VIEWER");
    },
    isOneOfRoleProduction(): boolean {
      return (
        this.authRole.includes("PRODUCTION") ||
        this.authRole.includes("RESTRICTED_PRODUCTION")
      );
    },
    isRoleRestrictedProduction(): boolean {
      return this.authRole.includes("RESTRICTED_PRODUCTION");
    },
    isGarRole(): string | undefined {
      return this.authProfile?.attributes?.["GAR"] as
        | string
        | undefined; /*CHEF_ETABLISSEMENT, ENSEIGNANT, ELEVE, undefined */
    },
    isGarStudent(): boolean {
      return "ELEVE" === this.isGarRole;
    },
    isVideoOrga(): boolean {
      return this.authVideoConfig.active;
    },
  },
  actions: {
    authUpdate(authentication: any) {
      this.authName = authentication.name ?? this.authName;
      this.authOrgaId = authentication.organisationId ?? this.authOrgaId;
      this.authOrgaName = authentication.organisationName ?? this.authOrgaName;
      this.authRole = authentication.role ?? this.authRole;
    },
    authUpdateParam(oAuthParam: any) {
      this.authParam = oAuthParam;
    },
    authUpdateProfile(profile: any) {
      this.authProfile = profile;
      this.authName = profile.firstname + " " + profile.lastname;
    },
    authUpdateOrganisation(organisation: any) {
      this.authOrganisation = organisation;
      const saveFetchStore = useSaveFetchStore();
      saveFetchStore.forceUpdateAttributes(
        organisation.id,
        organisation.attributes,
      );
      saveFetchStore.forceUpdateData(organisation.id, organisation);
    },
    async fetchProfileAsynchrone() {
      try {
        const organisationData  = await classicApi.fetchData<{
          [key: string]: string;
        }>({
          api: 0,
          path:"organisation/attributes/" + encodeURI(this.authOrganisation.id)
        });
        this.authVideoConfig = await classicApi.fetchData<VideoConfig>({
          api: 0,
          path:"video/config/" + encodeURI(this.authOrganisation.id),
        });
        const organisation: Organisation = {
          ...this.authOrganisation,
          ...{ attributes: organisationData },
        };
        if (organisation.attributes?.SEPA) {
          const orgaSepa = Object.getOwnPropertyDescriptor(
            organisation.attributes,
            "SEPA",
          );
          if (orgaSepa) {
            Object.defineProperty(organisation.attributes, "iban", orgaSepa);
          }
          delete organisation.attributes["SEPA"];
        }
        this.authUpdateOrganisation(organisation);
      } catch {
        if (this.authReload > 5) {
          return;
        }
        this.authReload += 1;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await this.fetchProfileAsynchrone();
      }
    },
    async fetchProfile() {
      try {
        const profileData = await classicApi.fetchData<KeycloakInfo>({
          api: 20,
          path:"userinfo",
        });
        const availablesOrganisations = await classicApi.fetchData<Array<Organisation>>({
          api: 0,
          path:"user/me/organisations",
        });
        const array = availablesOrganisations ?? [];
        array.sort(function (a: Organisation, b: Organisation) {
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          }
          if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          }
          return 0;
        });
        const profile = {
          firstname: profileData.given_name,
          lastname: profileData.family_name,
          email: profileData.email,
          userId: profileData.sub,
          attributes: {
            CGUValid: profileData.CGUValid,
            GAR: profileData.GAR,
            description: profileData.description,
            imageUrl: profileData.imageUrl,
            active_organisation: profileData.active_organisation,
          },
          organisations: array,
        };
        this.authUpdateProfile(profile);
        if (!profileData.active_organisation) {
          return;
        }
        const activeOrganisation = await classicApi.fetchData<Organisation>({
          api: 0,
          path:"organisation/" + profileData.active_organisation,
        });
        this.authUpdate({
          organisationId: activeOrganisation.id,
          organisationName: activeOrganisation.name,
        });
        this.authUpdateOrganisation(activeOrganisation);
        this.fetchProfileAsynchrone();
      } catch {
        if (this.authReload > 5) {
          return;
        }
        this.authReload += 1;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await this.fetchProfile();
      }
    },
  },
});
