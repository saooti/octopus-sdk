export interface PrivateOrganisation {
  privacy: string; //SECURED PRIVATE PUBLIC
  accountCreation: string; // ENABLED DISABLED
  referrers: Array<string>;
  cidrs: Array<string>;
  mailDomains: Array<string>;
}

export function emptyPrivateOrganisation(): PrivateOrganisation {
  return {
    privacy: "PUBLIC",
    accountCreation: "DISABLED",
    referrers: [],
    cidrs: [],
    mailDomains: [],
  };
}
