/* import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'; */
import { createApp, h } from 'vue';
import { createI18n, useI18n } from 'vue-i18n'
import I18nResources from './locale/messages';
import router from './router/router';
import moment from 'moment';
import store from '@/store/AppStore.js';
let paramStore = require('./store/paramStore');
import App from './App.vue';
import { VueReCaptcha } from "vue-recaptcha-v3";
moment.locale('fr');
//Gestion de l'i18n
let messages = {};
if (store.state.general.education) {
  messages = {
    fr: { ...I18nResources.fr, ...I18nResources.educationfr },
    en: I18nResources.en,
  };
}
const i18n = createI18n({
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
    let app = createApp({
      store,
      router,
      components: {
        App,
      },
      setup() {
        const { t } = useI18n()
        return { t }
      },
      render: () => h(App),
    })
    /* app.use(BootstrapVue);
    app.use(IconsPlugin); */
    app.use(i18n);
    app.use(VueReCaptcha as any, { siteKey: '6LfyP_4ZAAAAAPODj8nov2LvosIwcX0GYeBSungh' });

    app.mount('#app');
  });
