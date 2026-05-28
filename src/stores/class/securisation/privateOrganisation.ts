export enum OrganisationPrivacy {
  SECURED = 'SECURED',
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC'
}

export interface PrivateOrganisation {
  privacy: OrganisationPrivacy;
  accountCreation: string; // ENABLED DISABLED
  referrers: Array<string>;
  cidrs: Array<string>;
  mailDomains: Array<string>;
}

export function emptyPrivateOrganisation(): PrivateOrganisation {
  return {
    privacy: OrganisationPrivacy.PUBLIC,
    accountCreation: "DISABLED",
    referrers: [],
    cidrs: [],
    mailDomains: [],
  };
}
