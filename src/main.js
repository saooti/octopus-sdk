import Vue, { createApp, h } from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import App from './App.vue';
import VueI18n from 'vue-i18n';
import I18nResources from './locale/messages';
import router from '@/router/router';
import moment from 'moment';
import store from '@/store/AppStore';
import router from './router'
let paramStore = require('./store/paramStore');

moment.locale('fr');
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

//Gestion de l'i18n
Vue.use(VueI18n);
let messages = I18nResources;
if (store.state.general.education) {
  messages = {
    fr: { ...I18nResources.fr, ...I18nResources.educationfr },
    en: I18nResources.en,
  };
}
const i18n = new VueI18n({
  locale: 'fr',
  messages: messages,
});

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
    createApp({
      i18n,
      render: () => h(App)
    }).use(router).use(router).use(store).mount('#app');
  });
