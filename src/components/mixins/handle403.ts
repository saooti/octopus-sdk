import { AxiosError } from "axios";
import { defineComponent } from "vue";
import { useAuthStore } from "@/stores/AuthStore";
import { mapState } from "pinia";
import { isClient } from '../../helper/environment';
export const handle403 = defineComponent({
  computed: {
    ...mapState(useAuthStore, ["authOrgaId"]),
  },
  methods: {
    handle403(error: AxiosError): void {
      if (isClient && 403 === error.response?.status) {
        if (undefined === this.authOrgaId) {
          window.location.href = window.location.origin + "/sso/login";
        } else {
          this.$router.push({
            path: "/main/pub/error",
          });
        }
      }
    },
  },
});
