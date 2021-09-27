import Vue from 'vue';
import { 
  ModalPlugin, 
  FormRadioPlugin, 
  CardPlugin, 
  ButtonPlugin, 
  DropdownPlugin, 
  PopoverPlugin,
  TabsPlugin,
  FormGroupPlugin,
  FormTextareaPlugin,
  CollapsePlugin } from 'bootstrap-vue';
import App from './App.vue';
import VueI18n from 'vue-i18n';
import I18nResources from './locale/messages';
import router from '@/router/router';
const moment = require('moment');
import store from '@/store/AppStore';
const paramStore = require('./store/paramStore');

Vue.use(ModalPlugin); 
Vue.use(FormRadioPlugin); 
Vue.use(CardPlugin); 
Vue.use(ButtonPlugin); 
Vue.use(FormTextareaPlugin); 
Vue.use(DropdownPlugin); 
Vue.use(PopoverPlugin); 
Vue.use(TabsPlugin); 
Vue.use(FormGroupPlugin);
Vue.use(CollapsePlugin);
Vue.config.productionTip = false;

//Gestion de l'i18n
Vue.use(VueI18n);
//@ts-ignore
const navigatorLang = navigator.language || navigator.userLanguage;
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
const i18n = new VueI18n({
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
    new Vue({
      i18n,
      store,
      router,
      render: h => h(App),
    }).$mount('#app');
  });
