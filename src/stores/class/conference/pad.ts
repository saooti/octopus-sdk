export interface Pad {
  lineId: number;
  ligneId?: number;
  interval?: number;
  paletteId?: number;
  loop?: boolean;
  volume?: number;
  automix?: boolean;
  url?: string;
  duration?: number;
  mediaId?: number;
  fadeInMode?: string;
  fadeInDuration?: number;
  elapsed?: number;
}
