import dayjs from "dayjs";
import classicApi from "../api/classicApi";
import { useAuthStore } from "../stores/AuthStore";
import { useApiStore } from "../stores/ApiStore";
import { useFilterStore } from "../stores/FilterStore";
import { FetchParam } from "@/stores/class/general/fetchParam";
import { Media } from "@/stores/class/general/media";
import { KeycloakRenewToken } from "@/stores/class/user/person";

export default {
  async createAuthenticatedFetchHeader(
    forceRefresh = false,
  ): Promise<{ [key:string]: string }> {
    const authStore = useAuthStore();
    if(""===authStore.authName){
      return {};
    }
    const currentTime = dayjs();
    const expirationDate = dayjs(authStore.authParam.expiration);

    if (currentTime.isAfter(expirationDate) || forceRefresh) {
      const bearerToken = await this.updateAccessToken();
      return { Authorization: "Bearer " + bearerToken };
    } else {
      const bearerToken = authStore.authParam.accessToken;
      return { Authorization: "Bearer " + bearerToken };
    }
  },
  async updateAccessToken(): Promise<string> {
    const authStore = useAuthStore();
    const data = await this.refreshToken();
    if (!data) {
      return "";
    }
    authStore.authParam.expiration = data.expiration;
    authStore.authParam.accessToken = data.accessToken;
    authStore.authParam.refreshToken = data.refreshToken;
    return data.accessToken;
  },
  async refreshTokenLoop(): Promise<void> {
    const authStore = useAuthStore();
    const currentTime = dayjs();
    const expirationDate = dayjs(authStore.authParam.expiration);
    if (currentTime.isAfter(expirationDate)) {
      await this.updateAccessToken();
    }
    const millisecondDifference = dayjs(authStore.authParam.expiration).diff(
      dayjs(),
      "millisecond",
    );
    setTimeout(
      () => {
        this.refreshTokenLoop();
      },
      Math.max(millisecondDifference - 5000, 0),
    );
  },
  async refreshToken(): Promise<
    | {
        accessToken: string;
        refreshToken: string;
        expiration: Date;
      }
    | undefined
  > {
    const authStore = useAuthStore();
    const response = await classicApi.postData<KeycloakRenewToken>({
      api: 20,
      path:"token",
      contentType:"urlencoded",
      dataToSend:{
        client_id: authStore.authParam.clientId,
        grant_type: "refresh_token",
        refresh_token: authStore.authParam.refreshToken,
      },
      catchFunction:() => {
        const filterStore = useFilterStore();
        filterStore.filterOrgaId = undefined;
        filterStore.filterImgUrl = undefined;
        window.location.href = "/logout";
      },
    });
    if (response) {
      return {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiration: dayjs().add(response.expires_in, "seconds").toDate(),
      };
    }
  },
  getMediaContent(media: Media | undefined): string {
    if (!media) {
      return "";
    }
    const apiStore = useApiStore();
    const authStore = useAuthStore();
    let timing = "#t=" + (media.cueIn ?? 0);
    if (media.cueOut) {
      timing += "," + media.cueOut;
    }
    return (
      apiStore.mediaUrl +
      "media/content/" +
      media?.mediaId +
      "?access_token=" +
      authStore.authParam.accessToken +
      timing
    );
  },

  getUriSearchParams(parameters: FetchParam): URLSearchParams {
    const _return = new URLSearchParams();
    for (const [key, value] of Object.entries(parameters)) {
      // remove empty array for stats #12323
      if (
        undefined !== value &&
        "" !== value &&
        (!Array.isArray(value) || (Array.isArray(value) && value.length))
      ) {
        _return.append(key, value.toString());
      }
    }
    return _return;
  },
  transformObjectValueToString<T>(object: T): { [key: string]: string } {
    const objectString: { [key: string]: string } = {};
    for (const key in object) {
      const value = object[key];
      if (null !== value && "object" === typeof value) {
        objectString[key] = JSON.stringify(value);
      } else if (value) {
        objectString[key] = (value as any).toString();
      }
    }
    return objectString;
  },
};
