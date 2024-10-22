import { Category } from "../general/category";
import { Emission } from "../general/emission";

export interface AdserverData {
  name: string;
  loading: boolean;
  first: number;
  size: number;
  totalCount: number;
  data: Array<Category> | Array<Emission>;
}
