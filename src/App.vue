<template>
  <div id="app">
    <TopBar v-bind:displayMenu.sync="displayMenu" :isEducation="false" />
    <LeftMenu v-bind:displayMenu.sync="displayMenu" :isEducation="false" />
    <CategoryList />
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
import CategoryList from '@/components/display/categories/CategoryList.vue';
const octopusApi = require('@saooti/octopus-api');
import { state } from './store/paramStore';

import Vue from 'vue';
import { Category } from './store/class/category';
export default Vue.extend({
  name: 'app',
  components: {
    TopBar,
    LeftMenu,
    CategoryList,
    Footer,
  },
  data() {
    return {
      displayMenu: false as boolean,
    };
  },
  async created() {
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
});
</script>
