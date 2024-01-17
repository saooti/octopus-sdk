import { onClient } from '../../helper/environment';
import { defineComponent } from 'vue';
export default defineComponent({
  methods: {
    goBack(returnPage?:string){
      onClient(() => {
        if (window.history.length > 1) {
          this.$router.go(-1);
        } else {
          this.$router.push(returnPage??"/");
        }
      });
    }
  },
});
