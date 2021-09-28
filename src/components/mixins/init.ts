
import { Category } from "@/store/class/category";
import { orgaFilter } from '../mixins/organisationFilter';
const octopusApi = require('@saooti/octopus-api');
import { state } from '../../store/paramStore';
export const initSDK = {
  mixins: [orgaFilter],
  methods: {
    async initSdk() {
      if (0 === state.generalParameters.allCategories.length) {
        octopusApi.fetchCategories({ lang: this.$i18n.locale }).then((data: Array<Category>) => {
          this.$store.commit('categoriesSet', data);
        });
      }else{
        this.$store.commit('categoriesSet', state.generalParameters.allCategories);
      }
      const captcha = (document.getElementsByClassName('grecaptcha-badge')[0] as HTMLElement);
      if (captcha) {
        captcha.style.display = 'none';
      }
    },
  },
};
