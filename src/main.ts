import { createApp } from 'vue';
import { VueReCaptcha } from 'vue-recaptcha-v3';
/* import { 
  ModalPlugin, 
  FormRadioPlugin, 
  CardPlugin, 
  ButtonPlugin, 
  DropdownPlugin, 
  PopoverPlugin,
  TabsPlugin,
  FormGroupPlugin,
  FormTextareaPlugin,
  CollapsePlugin } from 'bootstrap-vue-3'; */
import bootstrap from 'bootstrap-vue-3';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import App from './App.vue';
import { createI18n } from 'vue-i18n';
import I18nResources from './locale/messages';
import router from '@/router/router';
const moment = require('moment');
import store from '@/store/AppStore';
const paramStore = require('./store/paramStore');

//TODO
const navigatorLang = navigator.language /* || navigator.userLanguage */;
let language = 'fr';
if(navigatorLang.includes('en')){
  language = 'en';
}
let messages: any = I18nResources;
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
paramStore
  .initialize({
    generalParameters: {
      organisationId: 'ecbd98d9-79bd-4312-ad5e-fc7c1c4a191c',
    },
    podcastPage: {},
    podcastsPage: {},
    emissionsPage: {},
    emissionPage: {},
    intervenantPage: {},
    searchPage: {},
    player: {},
    organisation: {},
    octopusApi: {},
    footer: {},
  })
  .then(() => {
    createApp(App)
    .use(i18n)
    .use(store)
    .use(router)
    .use(bootstrap)
    .use(VueReCaptcha, { siteKey: '6LfyP_4ZAAAAAPODj8nov2LvosIwcX0GYeBSungh' })
    /* .use(ModalPlugin)
    .use(FormRadioPlugin)
    .use(CardPlugin)
    .use(ButtonPlugin)
    .use(FormTextareaPlugin)
    .use(DropdownPlugin)
    .use(PopoverPlugin)
    .use(TabsPlugin)
    .use(FormGroupPlugin)
    .use(CollapsePlugin) */
    .mount('#app');
  });