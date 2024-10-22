import { createApp } from "vue";
import VueLazyLoad from "vue3-lazyload";
import App from "./App.vue";
import InitializeApi from "./api/initialize";
import { setupI18n } from "./i18n";
import router from "@/router/router";
import { createPinia } from "pinia";
import paramStore from "@/stores/ParamSdkStore";
import '../public/css/fonts/localFonts/style.css';
import { useApiStore } from "./stores/ApiStore";
import { useAuthStore } from "./stores/AuthStore";


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
  emissionsPage: {},
  player: {},
});

const pinia = createPinia();
const initState = await InitializeApi.fetchInitState();
const app = createApp(App);
// Initialisation store
app.use(i18n).use(pinia).use(router).use(VueLazyLoad);
const apiStore = useApiStore();
let authStore = undefined;
apiStore.initApis({
  apiUrl: initState.apiUri,
  billingUrl: initState.billingUri,
  chapteringUrl: initState.chapteringUri,
  commentUrl: initState.commentsUri,
  frontendUrl: initState.frontendUri,
  hlsUrl: initState.hlsUri,
  imageUrl: initState.imageUri,
  importerUrl: initState.importerUri,
  keycloakUrl: initState.keycloakApiUri,
  keycloakOpenAiUrl: initState.accessKeycloakUri,
  mediaUrl: initState.mediaUri,
  miniplayerUrl: initState.playerUri,
  openAiUrl: initState.openAiUri,
  processorUrl: initState.processorUri,
  radioUrl: initState.radioUri,
  recoUrl: initState.recoUri,
  rtmpUrl: initState.rtmpUri,
  speechToTextUrl: initState.speechToTextUri,
  textToSpeechUrl: initState.textToSpeechUri,
  studioUrl: initState.studioUri,
  videoMakerUrl: initState.videomakerUri,
  storageUrl: initState.storageUri,
  statRadioUrl: initState.statRadioUri,
});

if (initState.authenticated) {
  authStore = useAuthStore();
  authStore?.authUpdate({
    name: initState.name,
    role: initState.role,
  });
  authStore?.authUpdateParam({
    accessToken: initState.accessToken,
    refreshToken: initState.refreshToken,
    expiration: initState.expiration,
    clientId: initState.clientId,
  });
  await authStore?.fetchProfile();
}
router.isReady().then(() => {
  /* app.mixin({
    beforeCreate() {
      if (this.$options.watch) {
        Object.entries(this.$options.watch).forEach(([watcherKey, func]) => {
          // @ts-ignore
          this.$options.watch[watcherKey] = new Proxy(func, {
            apply(target, thisArg) {
              let targetAny : any= target;
              console.log(`Called watcher ${targetAny.name} on component ${thisArg.$options.name}`);
            },
          });
        });
      }
    },
  });  */
  app.mount('#app');
})