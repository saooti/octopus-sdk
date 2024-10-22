import { Organisation } from "../general/organisation";

export interface Person {
  attributes?: {
    [key: string]: string | number | boolean | undefined | Array<string>;
  };
  email: string;
  emailVerified: boolean;
  enabled: true;
  first: string;
  last: string;
  notSeenOnKeycloak: number;
  userId: string;
  organisation?: Organisation;
  activeOrganisation?: Organisation;
  organisations?: Array<Organisation>;
}

export interface KeycloakInfo {
  CGUValid?: string;
  GAR?: string;
  description?: string;
  imageUrl?: string;
  active_organisation: string;
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  "group-ids": Array<string>;
  locale: string;
  name: string;
  preferred_username: string;
  realm_access: {
    roles: Array<string>;
  };
  sub: string;
}

export interface KeycloakRenewToken {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token: string;
  "not-before-policy": number;
  session_state: string;
  scope: string;
}
