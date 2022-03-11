import { AxiosError } from 'axios';
import { defineComponent } from 'vue';
export const handle403 = defineComponent({
  methods: {
    handle403(error: AxiosError): void {
      if (403 === error.response?.status) {
        if(!this.$store.state.authentication.isAuthenticated){
          this.$router.push("/sso/login");
        }else{
          this.$router.push({
            path: '/main/pub/error'
          });
        }
      }
    },
  },
});