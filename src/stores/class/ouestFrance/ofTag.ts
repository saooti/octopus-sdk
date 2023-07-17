export interface OfTag {
  actif: boolean;
  chemin: string;
  dateMaj: string;
  entites: Array<string>;
  id: string;
  idDrupal: string;
  ignoreCommuneInactive: boolean;
  ignorePage: boolean;
  ignorePush: boolean;
  ignoreSeo: boolean;
  noms: Array<string>;
  redactions: Array<string>;
  slug: string;
  source: string;
  version: number;
}
export function emptyOfTag(): OfTag {
  return {
    actif: false,
    chemin: "",
    dateMaj: "",
    entites: [],
    id: "fakeTag",
    idDrupal: "fakeTag",
    ignoreCommuneInactive: false,
    ignorePage: false,
    ignorePush: false,
    ignoreSeo: false,
    noms: [],
    redactions: [],
    slug: "",
    source: "",
    version: 0,
  };
}
