import { Cartouche } from "./cartouche";

export interface Cartouchier {
  cartouchierId?: number;
  title: string;
  organisationId: string;
  cartouches: { [key: string]: Cartouche };
  cartoucheComplete?: { [key: string]: Cartouche };
}
