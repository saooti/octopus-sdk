<template>
  <div id="app">
    <TopBar v-model:displayMenu="displayMenu" :isEducation="false" />
    <LeftMenu v-model:displayMenu="displayMenu" :isEducation="false" />
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
import { state } from './store/paramStore.js';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'app',
  components: {
    TopBar,
    LeftMenu,
    CategoryList,
    Footer,
  },
  async created() {
    let captcha = document.getElementsByClassName('grecaptcha-badge')[0];
    if (captcha) {
      captcha.style.display = 'none';
    }
    let orgaId = '';
    if (this.$route.query.productor) {
      orgaId = this.$route.query.productor;
    } else {
      orgaId = state.generalParameters.authenticated;
    }
    const response = await octopusApi.fetchOrganisation(orgaId);
    store.commit('filterOrga', {
      orgaId: orgaId,
      imgUrl: response.imageUrl,
    });
    const isLive = await octopusApi.liveEnabledOrganisation(orgaId);
    store.commit('filterOrgaLive', isLive);
  },

  data() {
    return {
      displayMenu: false,
    };
  },
});
</script>
