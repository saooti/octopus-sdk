import { Cartouche } from "./cartouche";

export interface Cartouchier {
  cartouchierId?: number;
  title: string;
  organisationId: string;
  cartouches: { [key: string]: Cartouche };
  /** ID of the user that created this cartouchier */
  ownerId?: string;
}
