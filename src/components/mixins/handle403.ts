import { AxiosError } from "axios";
import { defineComponent } from "vue";
import { state } from "../../stores/ParamSdkStore";
export const handle403 = defineComponent({
  methods: {
    handle403(error: AxiosError): void {
      if (403 === error.response?.status) {
        if (undefined === state.generalParameters.organisationId) {
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
