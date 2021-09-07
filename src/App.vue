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
      const response = await octopusApi.fetchOrganisation(orgaId);
      this.$store.commit('filterOrga', {
        orgaId: orgaId,
        imgUrl: response.imageUrl,
      });
      const isLive = await octopusApi.liveEnabledOrganisation(orgaId);
      this.$store.commit('filterOrgaLive', isLive);
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
