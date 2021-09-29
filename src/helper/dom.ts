export default {
  convertRemToPixels(rem: number) {
    return (
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  },
};