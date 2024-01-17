
import {debounce} from './debounce';
import { isServer } from '../../helper/environment';
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
    if(isServer){return;}
    this.debounceResizeEvent = debounce(this.handleResize, 500);
    window.addEventListener('resize', this.debounceResizeEvent);
    this.handleResize();
  },
  unmounted() {
    if(isServer){return;}
    window.removeEventListener('resize', this.debounceResizeEvent);
  },
  methods: {
    handleResize(): void {
      this.windowWidth= window.innerWidth;
      this.isPhone =this.windowWidth < 960;
    },
  },
});