<template>
  <div
    v-show="isHeaderDisplay"
    class="header-img flex-column justify-content-end"
    :style="backgroundDisplay"
  >
    <h1>{{ titleDisplay }}</h1>
    <div
      v-show="isDisplay"
      class="d-flex flex-column justify-content-end"
    >
      <ol
        v-if="filterIab || filterRubrique.length"
        class="octopus-breadcrumb d-flex align-items-center justify-content-center flex-wrap"
      >
        <li class="octopus-breadcrumb-li">
          <a
            href="#"
            @click="removeFilter(-1, $event)"
          >{{ $t('All') }}</a>
        </li>
        <li
          v-if="filterIab"
          class="octopus-breadcrumb-li"
        >
          {{ filterIab.name }}
        </li>
        <li 
          v-for="(filter, index) in filterRubrique" 
          :key="filter.rubriqueId"
          class="d-flex align-items-center octopus-breadcrumb-li"
          :class="filterRubrique.length-1 === index ? 'active':''"
        >
          <a
            v-if="filterRubrique.length - 1 !== index"
            href="#"
            @click="removeFilter(index,$event)"
          >{{ filter.nameRubriquage }}</a>
          <div
            v-else
            class="fw-bold"
          >
            {{ filter.nameRubriquage }}
          </div>
          <div class="mx-1">
            :
          </div>
          <RubriqueChooser
            v-if="getRubriques(filter.rubriquageId).length"
            class="ms-2 multiselect-transparent multiselect-white"
            :multiple="false"
            :rubriquage-id="filter.rubriquageId"
            :rubrique-selected="filter.rubriqueId"
            :all-rubriques="getRubriques(filter.rubriquageId)"
            :no-deselect="true"
            width="auto"
            @selected="onRubriqueSelected(index,$event)"
          />
        </li>
      </ol>
      <CategoryList
        v-if="!filterIab && !rubriquageFilter.length"
        :is-filter="true"
        :is-display="isDisplay"
        @categoriesLength="checkIfCategories"
      />
      <RubriqueList
        v-else-if="isDisplay && rubriquageFilter.length !== filterRubrique.length"
        :rubriquages="rubriquageFilter"
      />
    </div>
  </div>
  <div
    v-if="!isDisplay"
    class="category-filter-no-filter"
  />
</template>

<script lang="ts">
import { Rubriquage } from '@/stores/class/rubrique/rubriquage';
import { RubriquageFilter } from '@/stores/class/rubrique/rubriquageFilter';
import { Rubrique } from '@/stores/class/rubrique/rubrique';
import { useFilterStore } from '@/stores/FilterStore';
import { state } from '../../../stores/ParamSdkStore';
import { mapState, mapActions } from 'pinia';
import { defineComponent, defineAsyncComponent } from 'vue';
const CategoryList = defineAsyncComponent(() => import('./CategoryList.vue'));
const RubriqueList = defineAsyncComponent(() => import('./../rubriques/RubriqueList.vue'));
const RubriqueChooser = defineAsyncComponent(() => import('../rubriques/RubriqueChooser.vue'));
export default defineComponent({
  name: 'CategoryFilter',

  components:{
    CategoryList,
    RubriqueList,
    RubriqueChooser
  },
  data() {
    return {
      isCategories: false as boolean,
    };
  },
  computed: {
    ...mapState(useFilterStore, ['filterIab', 'filterRubrique', 'filterRubriquage', 'filterOrgaId']),
    isDisplay(): boolean {
      return ("homePriv" === this.$route.name ||"home" === this.$route.name ||"podcasts" === this.$route.name||"emissions" === this.$route.name) 
      && (this.isCategories || undefined!==this.filterIab || 0!==this.filterRubrique.length || 0!==this.rubriquageFilter.length);
    },
    isHeaderDisplay(){
      return this.isDisplay ||'participants' === this.$route.name || 'playlists'=== this.$route.name;
    },
    rubriquageFilter(): Array<Rubriquage>{
      return this.filterOrgaId ? this.filterRubriquage : [];
    },
    titleDisplay(): string{
      let title = "";
      switch (this.$route.name) {
        case 'podcasts':title= state.podcastsPage.titlePage ?? this.$t('All podcasts');break;
        case 'emissions':title= state.emissionsPage.titlePage??this.$t('All emissions');break;
        case 'participants': title= state.intervenantsPage.titlePage ?? this.$t('All participants');break;
        case 'playlists': title= this.$t('All playlists');break;
        default:break;
      }
      return title;
    },
    backgroundDisplay():string{
      let imgName = "home";
      switch (this.$route.name) {
        case 'podcasts': imgName= "podcasts";break;
        case 'emissions': imgName= "emissions";break;
        case 'participants': imgName= "intervenants";break;
        case 'playlists': imgName= "playlists";break;
        default:break;
      }
      return `background-image: url('/img/header-${imgName}.webp');`;
    }
  },
  methods:{
    ...mapActions(useFilterStore, ['filterUpdateIab', 'filterUpdateRubrique']),
    checkIfCategories(length: number): void{
      this.isCategories = 0!==length;
    },
    onRubriqueSelected(index: number, rubrique: Rubrique): void {
      if(!rubrique ||this.filterRubrique[index].rubriqueId === rubrique.rubriqueId){
        return;
      }
      const filter = Array.from(this.filterRubrique);
      filter[index].rubriqueId = rubrique.rubriqueId||0;
      this.filterUpdateRubrique(filter);
      const queryString = filter.map(value =>  value.rubriquageId+':'+value.rubriqueId).join();
      this.$router.replace({ query: { ...this.$route.query, ...{ rubriquesId: queryString }} });
    },
    getRubriques(rubriquageId: number): Array<Rubrique>{
      const rubriquage = this.filterRubriquage.find((x: Rubriquage) => {
        return x.rubriquageId === rubriquageId;
      });
      return rubriquage ? rubriquage.rubriques : [];
    },
    removeFilter(index: number, event?: { preventDefault: () => void }): void{
      if(this.filterIab){
        if (this.$route.query.iabId) {
          this.$router.replace({ query: {...this.$route.query, ...{iabId: undefined} } });
        }
        this.filterUpdateIab();
      }else{
        const newFilter: Array<RubriquageFilter>  = Array.from(this.filterRubrique);
        newFilter.splice(index + 1);
        if (this.$route.query.rubriquesId) {
          const queryString = newFilter.map(value => value.rubriquageId+':'+value.rubriqueId).join();
          this.$router.replace({ query: { ...this.$route.query, ...{ rubriquesId:"" !== queryString? queryString : undefined}} });
        }

        this.filterUpdateRubrique(newFilter);
      }
      if(event){
        event.preventDefault();
      }
    }
  }
})
</script>
<style lang="scss">
.octopus-app{
  .header-img{
    display: flex;
    min-height: 15rem;
    background-size: cover;
    h1{
      margin: 2rem 1rem auto;
      font-size: 2rem;
      color: white;
    }
    @media (max-width: 960px) {
      min-height: 6rem;
    }
  }
  .octopus-breadcrumb{
    padding: 1rem;
    align-items: center;
    .octopus-breadcrumb-li{
      list-style: none;
      color: white !important;
      a{
        color: white !important;
        font-weight: bold;
      }
      &:after {
        content: "-";
        margin: 0 0.5rem;
      }
      &:last-child {
        &:after {
          content: "";
        }
      }
    }
  }
  .category-filter-no-filter{
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: white;
    z-index: -1;
  }
}
</style>