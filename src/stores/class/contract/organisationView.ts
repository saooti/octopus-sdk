import { Contract } from "./contract";

export interface OrganisationView {
  imageUrl: string;
  organisationId: string;
  name: string;
  active: boolean;
  contracts: Array<Contract>;
}
