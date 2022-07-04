
import { Category } from "@/store/class/general/category";
import { orgaFilter } from '../mixins/organisationFilter';
import octopusApi from '@saooti/octopus-api';
import { state } from '../../store/paramStore';
import { defineComponent } from 'vue';
export const initSDK = defineComponent({
  mixins: [orgaFilter],
  methods: {
    async initSdk() {
      if (0 === (state.generalParameters.allCategories as Array<Category>).length) {
        octopusApi.fetchDataWithParams<Array<Category>>(0, `iab/list${state.octopusApi.organisationId? '/'+state.octopusApi.organisationId : ''}`, { lang: this.$i18n.locale }).then((data: Array<Category>) => {
          this.$store.commit('categoriesSet', data);
        });
      }else{
        this.$store.commit('categoriesSet', (state.generalParameters.allCategories as Array<Category>));
      }
      const captcha = (document.getElementsByClassName('grecaptcha-badge')[0] as HTMLElement);
      if (captcha) {
        captcha.style.display = 'none';
      }
    },
  },
});
