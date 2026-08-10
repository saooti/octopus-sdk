import { Rubrique } from "./rubrique";

export const RUBRIQUAGE_HOMEORDER_RESET = -2;

export enum RubriquageMode {
  OPTIONAL = 'OPTIONAL',
  MANDATORY = 'MANDATORY',
  RESTRICTIVE = 'RESTRICTIVE'
}

export interface Rubriquage {
  organisationId?: string;
  rubriquageId?: number;
  rubriques: Array<Rubrique>;
  title: string;
  homePageOrder?: number | null;
  organisationPrivacy?: string;
  mode: RubriquageMode;
}
