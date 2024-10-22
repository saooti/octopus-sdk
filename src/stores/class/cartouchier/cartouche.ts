import { Media } from "../general/media";

export interface Cartouche {
  media?: Media;
  cartoucheId?: number;
  colorId?: string;
  level?: number;
  id: number;
  width: number;
  interval?: number;
  elapsed?: number;
  loop?: boolean;
}

export function emptyCartouche(): Cartouche {
  return {
    id: 0,
    width: 0,
    level: 100,
  };
}
