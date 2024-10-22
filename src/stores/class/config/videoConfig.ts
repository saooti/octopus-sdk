export interface VideoConfig {
  active: boolean;
  provider?: string;
  digiteka?: {
    mdtk?: string;
    zone?: string;
    catalog: string;
  };
}
