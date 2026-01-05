import { AxiosError } from "axios";
import { useAuthStore } from "../../stores/AuthStore";
import { useRouter } from "vue-router";

export const useErrorHandler = ()=>{

  const authStore = useAuthStore();
  const router = useRouter();

  function handle403(error: AxiosError): void {
    if (403 === error.response?.status) {
      if (undefined === authStore.authOrgaId) {
        window.location.href = window.location.origin + "/sso/login";
      } else {
        console.error(error);
        router.push({
          path: "/main/pub/error",
        });
      }
    }
  }

  return {
    handle403
  }
}
