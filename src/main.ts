import { createApp } from 'vue';
import { VueReCaptcha } from 'vue-recaptcha-v3';
import VueLazyLoad from 'vue3-lazyload';
import App from './App.vue';
import {setupI18n} from './i18n';
import router from '@/router/router';
import store from '@/store/AppStore';
import paramStore from '@/store/paramStore';
/* import 'popper.js/dist/popper.min.js'; */
/* import 'jquery/src/jquery.js'; */
/* import 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
 */


//TODO
const nameEQ = 'octopus-language=';
const ca = document.cookie.split(';');
let language = "";
for (let i = 0; i < ca.length; i++) {
  let c = ca[i];
  while (c.charAt(0) == ' ') c = c.substring(1, c.length);
  if (0 === c.indexOf(nameEQ)){
    language = c.substring(nameEQ.length, c.length);
    break;
  }
}
if(0===language.length){
  const navigatorLang = navigator.language /* || navigator.userLanguage */;
  language = 'fr';
  if(navigatorLang.includes('en')){
    language = 'en';
  }else if(navigatorLang.includes('it')){
    language = 'it';
  }else if(navigatorLang.includes('sl')){
    language = 'sl';
  }else if(navigatorLang.includes('es')){
    language = 'es';
  }else if(navigatorLang.includes('de')){
    language = 'de';
  }
}

const i18n = setupI18n({locale: language}, store.state.general.education);

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
  octopusApi: {}
});

// Initialisation store
createApp(App)
.use(i18n)
.use(store)
.use(router)
.use(VueLazyLoad)
.use(VueReCaptcha, { siteKey: '6LfyP_4ZAAAAAPODj8nov2LvosIwcX0GYeBSungh' })
.mount('#app');