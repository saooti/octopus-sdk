import { Rubrique } from "./rubrique";

export interface Rubriquage{
    organisationId: string;
    rubriquageId: number;
    rubriques: Array<Rubrique>;
    title: string;
}