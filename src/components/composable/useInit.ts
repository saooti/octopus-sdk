
import classicApi from "@/api/classicApi";
import { useAuthStore } from "../../stores/AuthStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { Category } from "@/stores/class/general/category";
import { useI18n } from "vue-i18n";

export const useInit= ()=>{

  const authStore = useAuthStore();
  const generalStore = useGeneralStore();

  const i18n = useI18n()

  async function initSdk() {
    classicApi.fetchData<Array<Category>>({
      api: 0,
      path:`iab/list${authStore.authOrgaId ? "/" + authStore.authOrgaId : ""}`,
      parameters:{ lang: i18n.locale.value },
    })
    .then((data: Array<Category>) => {
      if(data.length){
        generalStore.storedUpdateCategories(data);
      }
    });
    const captcha = document.getElementsByClassName(
      "grecaptcha-badge",
    )[0] as HTMLElement;
    if (captcha) {
      captcha.style.display = "none";
    }
  }


	return {
    initSdk
	}
}