import { createApp } from 'vue';
import { VueReCaptcha } from 'vue-recaptcha-v3';
import App from './App.vue';
import { createI18n, VueMessageType } from 'vue-i18n';
import I18nResources from './locale/messages';
import router from '@/router/router';
import moment from 'moment';
import store from '@/store/AppStore';
import { LocaleMessage } from '@intlify/core-base';
/* import 'popper.js/dist/popper.min.js'; */
/* import 'jquery/src/jquery.js'; */
/* import 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
 */

//TODO
const navigatorLang = navigator.language /* || navigator.userLanguage */;
let language = 'fr';
if(navigatorLang.includes('en')){
  language = 'en';
}
let messages: {[key: string]: LocaleMessage<VueMessageType>} = I18nResources;
if (store.state.general.education) {
  messages = {
    fr: { ...I18nResources.fr, ...I18nResources.educationfr },
    en: { ...I18nResources.en, ...I18nResources.educationen },
  };
}
const i18n = createI18n({
  locale: language,
  messages: messages,
});
moment.locale(language);

// Initialisation store
createApp(App)
.use(i18n)
.use(store)
.use(router)
.use(VueReCaptcha, { siteKey: '6LfyP_4ZAAAAAPODj8nov2LvosIwcX0GYeBSungh' })
.mount('#app');