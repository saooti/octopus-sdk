import { Organisation } from "../class/general/organisation";
import { Profile } from "../class/user/profile";

export interface AuthState {
  name: string;
  organisationId: string | undefined;
  organisationName: string | undefined;
  role: Array<string>;
  oAuthParam: {
    accessToken: string | undefined;
    refreshToken: string | undefined;
    expiration: Date | undefined;
  };
  profile: Profile;
  organisation: Organisation;
}
export function getDefaultAuthState(): AuthState {
  return {
    name: '',
    organisationId: undefined,
    organisationName: undefined,
    role: [''],
    oAuthParam: {
      accessToken: undefined,
      refreshToken: undefined,
      expiration: undefined,
    },
    profile: {
      userId: '',
    },
    organisation: {
      id: '',
      name: '',
      imageUrl: '',
      description: undefined,
      monetisable: undefined,
      location: undefined,
      comments: undefined,
      attributes: {
        RSS_CONTACT: undefined,
      },
    },
  };
}
