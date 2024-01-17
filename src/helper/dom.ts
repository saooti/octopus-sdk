import { isServer } from './environment';
export default {
  convertRemToPixels(rem: number): number {
    if(isServer){return 0;}
    return (
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  },
};
