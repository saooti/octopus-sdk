import { useGeneralStore } from "../../stores/GeneralStore";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

export const useMetaTitle = ()=>{

  const route = useRoute();
  const generalStore = useGeneralStore();
  const {t} = useI18n();

  function updateMetaTitle(){
    if("" !== route.meta.title){
      document.title = route.meta.title ? t(route.meta.title as string) + ' - ' + generalStore.metaTitle: generalStore.metaTitle;
    }
  }

  return {
    updateMetaTitle
  }
}
