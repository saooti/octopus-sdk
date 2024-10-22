export interface ItemDraggable {
  id: string;
  lines: Array<string>;
  x: number;
  y: number;
  font: string;
  size: number;
  realSize: number;
  width: number;
  realWidth: number;
  color: string;
  background: string;
}
export interface MouseInfo {
  x: number;
  y: number;
  dragOffsetX: number;
  dragOffsetY: number;
  button: boolean;
  dragging: boolean;
  resize: boolean;
}

export interface PreviewParameters {
  heightFormat: number;
  widthFormat: number;
  backgroundSize: string;
  imageBackground: string;
  linearBrightness: string;
  colorBorders: string;
}
