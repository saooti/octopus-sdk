export interface OrganisationPackage {
  orgaId: string;
  name: string;
  choosePackages: Array<OrgaBasePackageAssociation>;
  chooseOutPackages: Array<OrgaOutOfPackageAssociation>;
  limits: Array<Limit>;
  monthlyConsumptions: Array<Bill>;
}

export interface Limit {
  id: number;
  validFrom: string;
  validTo: string;
  monthlyLimit: number;
  service: string;
  temporality?: number;
}
export interface AffineFormula {
  id: number;
  aaffine: number;
  baffine: number;
  min: number;
  max: number | null;
}

export interface BasePackage {
  packageId: number;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  monthlyPrice: number;
  baseOffer: boolean;
  active: boolean;
  generic?: boolean;
  logo: string;
  capacities: {
    [key: string]: number | undefined;
  };
}

export interface OutOfPackage {
  packageId: number;
  createdAt?: string;
  formulas: Array<AffineFormula>;
  service: string;
  ignorePackageCapacity: boolean;
  isDefault: boolean;
  name: string;
  active: boolean;
}

export interface OrgaOutOfPackageAssociation extends OrgaAssociation {
  billPackage: OutOfPackage;
}
export interface OrgaBasePackageAssociation extends OrgaAssociation {
  billPackage: BasePackage;
}
export interface OrgaAssociation {
  id: number;
  validFrom: string;
  validTo: string;
  temporality?: number;
  billPackage: OutOfPackage | BasePackage;
}

export interface Bill {
  yearMonth: string;
  consumption: number;
  limit: number;
  service: string;
  packageCapacity: number;
  outPackageCost: number;
  unitConsumption: number;
}

export function emptyBasePackage(): BasePackage {
  return {
    packageId: 0,
    nameFr: "",
    nameEn: "",
    descriptionFr: "",
    descriptionEn: "",
    monthlyPrice: 0,
    baseOffer: false,
    active: true,
    logo: "",
    capacities: {
      tts: 0,
      stt: 0,
      openAiOut: 0,
      openAiIn: 0,
      download: 0,
    },
  };
}
export function emptyOutOfPackage(): OutOfPackage {
  return {
    packageId: 0,
    formulas: [],
    service: "stt",
    ignorePackageCapacity: false,
    isDefault: false,
    name: "",
    active: true,
  };
}

export function emptyFormula(): AffineFormula {
  return {
    id: 0,
    aaffine: 0,
    baffine: 0,
    min: 0,
    max: 0,
  };
}
