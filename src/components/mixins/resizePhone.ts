
import debounce from './debounce';
import { defineComponent } from 'vue';
export default defineComponent({
  data() {
    return {
      isPhone: false as boolean,
      windowWidth: 0 as number,
      debounceResizeEvent: undefined as undefined|((...args: any[]) => void)
    };
  },
  created() {
    this.debounceResizeEvent = debounce(this.handleResize, 500);
    window.addEventListener('resize', this.debounceResizeEvent);
    this.handleResize();
  },
  unmounted() {
    window.removeEventListener('resize', this.debounceResizeEvent);
  },
  methods: {
    handleResize(): void {
      this.windowWidth= window.innerWidth;
      this.isPhone =this.windowWidth < 960;
    },
  },
});