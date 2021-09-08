<template>
  <div id="app">
    <TopBar v-bind:displayMenu.sync="displayMenu" :isEducation="false" />
    <LeftMenu v-bind:displayMenu.sync="displayMenu" :isEducation="false" />
    <CategoryFilter />
    <router-view />
    <Footer />
  </div>
</template>
<style lang="scss" src="@/assets/octopus-library.scss"></style>
<style lang="scss"></style>

<script lang="ts">
import TopBar from '@/components/misc/TopBar.vue';
import LeftMenu from '@/components/misc/LeftMenu.vue';
import Footer from '@/components/misc/Footer.vue';
import CategoryFilter from '@/components/display/categories/CategoryFilter.vue';
const octopusApi = require('@saooti/octopus-api');
import { state } from './store/paramStore';

import Vue from 'vue';
import { Category } from './store/class/category';
import { Rubriquage } from './store/class/rubriquage';
import { RubriquageFilter } from './store/class/rubriquageFilter';
import { Rubrique } from './store/class/rubrique';
export default Vue.extend({
  name: 'app',
  components: {
    TopBar,
    LeftMenu,
    CategoryFilter,
    Footer,
  },
  data() {
    return {
      displayMenu: false as boolean,
      initQueryRouter: false,
    };
  },
  methods:{
    async initApp(){
      await this.handleDisplayCategory();
      this.handleCaptcha();
      this.handleIabIdFilter();
      await this.handleOrganisationFilter();
      this.handleRubriquesFilter();
    },
    handleCaptcha(){
      const captcha = (document.getElementsByClassName('grecaptcha-badge')[0] as HTMLElement);
      if (captcha) {
        captcha.style.display = 'none';
      }
    },
    async handleDisplayCategory(){
      if (0 === state.generalParameters.allCategories.length) {
        const categories: Array<Category>= await octopusApi.fetchCategories({ lang: this.$i18n.locale });
        this.$store.commit('categoriesSet', categories);
      }else{
        this.$store.commit('categoriesSet', state.generalParameters.allCategories);
      }
    },
    async handleOrganisationFilter(){
      let orgaId = '';
      if (this.$route.query.productor && 'string'===typeof this.$route.query.productor) {
        orgaId = this.$route.query.productor;
      } else {
        orgaId = state.generalParameters.authenticated;
      }
      if(''===orgaId){
        return;
      }
      const response = await octopusApi.fetchOrganisation(orgaId);
      const data = await octopusApi.fetchTopics(orgaId);
      const isLive = await octopusApi.liveEnabledOrganisation(orgaId);
      this.$store.commit('filterOrga', {
        orgaId: orgaId,
        imgUrl: response.imageUrl,
        rubriquageArray: data.filter((element: Rubriquage)=>{
          return element.rubriques.length;
        }),
        isLive: isLive
      });
    },
    handleIabIdFilter(){
      if (this.$route.query.iabId && 'string'===typeof this.$route.query.iabId) {
        const iabId = parseInt(this.$route.query.iabId, 10);
        const category = this.$store.state.categories.filter((c: any) => {
          return c.id === iabId;
        });
        if(category.length){
          this.$store.commit('filterIab', category[0]);
        }
      }
    },
    handleRubriquesFilter(){
      if(0===this.$store.state.filter.rubriquageArray.length){
        return;
      }
      if (this.$route.query.rubriquesId && 'string'===typeof this.$route.query.rubriquesId) {
        const arrayFilter = this.$route.query.rubriquesId.split(',');
        const rubriquesFilter: Array<RubriquageFilter>=[];
        const filterLength = arrayFilter.length;
        for (let index = 0; index < filterLength; index++) {
          const rubriqueFilter = arrayFilter[index].split(':');
          const rubriquage = this.$store.state.filter.rubriquageArray.find((x: Rubriquage) => {
            return x.rubriquageId === parseInt(rubriqueFilter[0]);
          });
          if(rubriquage){
            const rubrique = rubriquage.rubriques.find((x: Rubrique) => {
              return x.rubriqueId === parseInt(rubriqueFilter[1]);
            });
            rubriquesFilter.push({rubriquageId: rubriquage.rubriquageId, rubriqueId:rubrique.rubriqueId, name: rubriquage.title +": "+rubrique.name});
          }
        }
        if(rubriquesFilter.length){
          this.$store.commit('filterRubrique', rubriquesFilter);
        }
      }
    }
  },
  watch: {
    '$route' () {
      if(!this.initQueryRouter){
        this.initQueryRouter = true;
        this.initApp();
      }
    },
  }
});
</script>
