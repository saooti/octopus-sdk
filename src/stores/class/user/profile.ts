import { Organisation } from "../general/organisation";

export interface Profile {
  firstname?: string;
  lastname?: string;
  email?: string;
  userId: string;
  imageUrl?: string;
  description?: string;
  organisations?: Array<Organisation>;
  scope: Array<number>;
  attributes?: {
    [key: string]: string | number | boolean | undefined | Array<string>;
  };
}
