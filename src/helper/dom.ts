import { defineComponent } from 'vue'
export default defineComponent({
  convertRemToPixels(rem: number) {
    return (
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  },
};