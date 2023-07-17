import { OfTag } from "./ofTag";
import { OfTagInfo } from "./ofTagInfo";
import { OfTagPage } from "./ofTagPage";
import { OfTagSeo } from "./ofTagSeo";
import { OfTagVente } from "./ofTagVente";

export interface OfTagWithParents {
  ancetreIds: string;
  ancetreNoms: Array<string>;
  ancetreNomsCanoniques: Array<string>;
  dateMaj: string;
  id: string;
  nbAncetres: number;
  nbEnfants: number;
  pageManquant: boolean;
  pushManquant: boolean;
  pushPossible: string;
  role: string;
  seoManquant: boolean;
  tag: OfTag;
  tagInfo: OfTagInfo;
  tagPage: OfTagPage;
  tagSeo: OfTagSeo;
  tagVente: OfTagVente;
  version: number;
}
