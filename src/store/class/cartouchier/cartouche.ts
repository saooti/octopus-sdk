import { Media } from '../general/media';

export interface Cartouche {
  mediaId?: number;
  media?: Media;
  title?: string;
  cartoucheId?: number;
  colorId?: string;
  level?: number;
  id: number;
  width: number;
  interval?:number;
  elapsed?:number;
  loop?:boolean;
}
