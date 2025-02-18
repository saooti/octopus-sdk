import { useRoute } from "vue-router";
import { useMetaTitle } from "./useMetaTitle";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

export const useMetaTitleWatch = ()=>{
  const { updateMetaTitle } = useMetaTitle();

  const route = useRoute();
  const i18n = useI18n();

  watch(route, () => updateMetaTitle(), {immediate:true});
  watch(()=>i18n.locale, () => updateMetaTitle());
}
