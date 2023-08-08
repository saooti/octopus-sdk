
import { defineComponent } from 'vue';
export const resizePhone = defineComponent({
  data() {
    return {
      isPhone: false as boolean,
      windowWidth: 0 as number
    };
  },
  created() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },

  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    handleResize(): void {
      this.windowWidth= window.innerWidth;
      this.isPhone =this.windowWidth < 960;
    },
  },
});