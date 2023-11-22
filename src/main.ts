import { createApp } from "vue";
import VueLazyLoad from "vue3-lazyload";
import App from "./App.vue";
import { setupI18n } from "./i18n";
import router from "@/router/router";
import { createPinia } from "pinia";
import paramStore from "@/stores/ParamSdkStore";

const nameEQ = "octopus-language=";
const ca = document.cookie.split(";");
let language = "";
for (const valueCookie of ca) {
  let c = valueCookie;
  while (c.startsWith(" ")) c = c.substring(1, c.length);
  if (0 === c.indexOf(nameEQ)) {
    language = c.substring(nameEQ.length, c.length);
    break;
  }
}
if (0 === language.length) {
  const navigatorLang = navigator.language;
  language = "fr";
  if (navigatorLang.includes("en")) {
    language = "en";
  } else if (navigatorLang.includes("it")) {
    language = "it";
  } else if (navigatorLang.includes("sl")) {
    language = "sl";
  } else if (navigatorLang.includes("es")) {
    language = "es";
  } else if (navigatorLang.includes("de")) {
    language = "de";
  }
}

const i18n = setupI18n({ locale: language }, false, false);

paramStore.initialize({
  generalParameters: {},
  podcastPage: {},
  podcastsPage: {},
  emissionsPage: {},
  emissionPage: {},
  intervenantPage: {},
  intervenantsPage: {},
  searchPage: {},
  player: {},
  footer: {},
  organisation: {},
  octopusApi: {},
});

const pinia = createPinia();
const app = createApp(App);
// Initialisation store
app.use(i18n).use(pinia).use(router).use(VueLazyLoad);
app.mount("#app");
