<template>
  <div
    v-if="isInit"
    id="app"
    :key="reload"
    class="octopus-app"
  >
    <TopBar
      v-model:displayMenu="displayMenu"
      :is-education="false"
    />
    <LeftMenu
      v-if="displayMenu"
      @close="displayMenu=false"
      :is-education="false"
    />
    <CategoryFilter />
    <router-view />
    <Footer />
  </div>
</template>

<script lang="ts">
import TopBar from '@/components/misc/TopBar.vue';
import Footer from '@/components/misc/Footer.vue';
import CategoryFilter from '@/components/display/categories/CategoryFilter.vue';
import { state } from './store/paramStore';
import { Rubriquage } from './store/class/rubrique/rubriquage';
import { RubriquageFilter } from './store/class/rubrique/rubriquageFilter';
import { Rubrique } from './store/class/rubrique/rubrique';
import { initSDK } from './components/mixins/init';
import { defineAsyncComponent, defineComponent } from 'vue'
import { Category } from './store/class/general/category';
const LeftMenu = defineAsyncComponent(() => import('@/components/misc/LeftMenu.vue'));
export default defineComponent({
  name: 'App',
  
  components: {
    TopBar,
    LeftMenu,
    CategoryFilter,
    Footer,
  },

  mixins: [initSDK],

  data() {
    return {
      displayMenu: false as boolean,
      reload: false as boolean,
      isInit: false as boolean,
    };
  },

  watch: {
    '$i18n.locale'(){
      this.$forceUpdate();
      this.reload = !this.reload;
    }
  },
  async created(){
    await this.initApp();
  },
  methods:{
    async initApp(){
      await this.initSdk();
      await this.handleOrganisationFilter();
      this.handleIabIdFilter();
      this.handleRubriquesFilter();
      this.isInit =true;
    },
    async handleOrganisationFilter(){
      let orgaId = '';
      if (this.$route.query.productor && 'string'===typeof this.$route.query.productor) {
        orgaId = this.$route.query.productor;
      } else if(state.generalParameters.organisationId){
        orgaId = state.generalParameters.organisationId;
      }
      if(''===orgaId){
        return;
      }
      await this.selectOrganisation(orgaId);
    },
    handleIabIdFilter(){
      if(this.$store.state.filter.organisationId){
        return;
      }
      if (this.$route.query.iabId && 'string'===typeof this.$route.query.iabId) {
        const iabId = parseInt(this.$route.query.iabId, 10);
        const category = this.$store.state.categories.filter((c: Category) => {
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
            rubriquesFilter.push({rubriquageId: rubriquage.rubriquageId, rubriqueId:rubrique.rubriqueId, nameRubriquage: rubriquage.title, nameRubrique :rubrique.name});
          }
        }
        if(rubriquesFilter.length){
          this.$store.commit('filterRubrique', rubriquesFilter);
        }
      }
    }
  }
})
</script>

<style lang="scss" src="@/assets/octopus-library.scss"></style>
