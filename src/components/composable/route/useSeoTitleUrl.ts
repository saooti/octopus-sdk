import { useGeneralStore } from "../../../stores/GeneralStore";
import { useRoute, useRouter } from "vue-router";
export const useSeoTitleUrl = ()=>{

  const router = useRouter();
  const route = useRoute();
  const generalStore = useGeneralStore();

  function updatePathParams(text: string) {
    const seoText = stringUrlEncode(text);
    if(seoText !== route.params.title){
      router.replace({ params: { ...route.params, ...{title:seoText}}, query: route.query});
    }
    document.title = text + " - "+ generalStore.metaTitle;
  }

  function stringUrlEncode(text: string): string {
    if(!text.length){
      return "";
    }
    const withoutSpecialChar = text.replaceAll(
      /[!"`'#%&,:;<>=\-_@{}~$.()*+/\\?[\]^|]+/gm, ' ');
    const trimText = withoutSpecialChar.trim();
    return "-"+trimText.replaceAll(/\s+/gm, '-');
  }

	return {
      updatePathParams,
      stringUrlEncode
	}
}
