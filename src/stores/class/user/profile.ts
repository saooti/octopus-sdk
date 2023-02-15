import { Organisation } from "../general/organisation";

export interface Profile {
  firstname?: string;
  lastname?: string;
  email?: string;
  userId: string;
  imageUrl?: string;
  description?: string;
  organisations?:Array<Organisation>;
  attributes?: {[key:string]: string|number|boolean|undefined|Array<string>};
}
