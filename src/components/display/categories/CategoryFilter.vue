<template>
  <div
    v-if="isDisplay"
    class="mt-3"
  >
    <nav
      v-if="categoryFilter || rubriqueFilter.length"
      title="breadcrumb"
    >
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a
            href="#"
            @click="removeFilter(-1, $event)"
          >{{ $t('All') }}</a>
        </li>
        <li
          v-if="categoryFilter"
          class="breadcrumb-item active"
        >
          {{ categoryFilter.name }}
        </li>
        <li 
          v-for="(filter, index) in rubriqueFilter" 
          :key="filter.rubriqueId"
          class="breadcrumb-item d-flex align-items-center"
          :class="rubriqueFilter.length-1 === index ? 'active':''"
        >
          <a
            v-if="rubriqueFilter.length - 1 !== index"
            href="#"
            @click="removeFilter(index,$event)"
          >{{ filter.nameRubriquage }}</a>
          <template v-else>
            {{ filter.nameRubriquage }}
          </template>
          <div class="mx-1">
            :
          </div>
          <RubriqueChooser
            v-if="getRubriques(filter.rubriquageId).length"
            class="ms-2 multiselect-transparent"
            :multiple="false"
            :rubriquage-id="filter.rubriquageId"
            :rubrique-selected="filter.rubriqueId"
            :all-rubriques="getRubriques(filter.rubriquageId)"
            :cannot-be-undefined="true"
            width="auto"
            @selected="onRubriqueSelected(index,$event)"
          />
        </li>
      </ol>
    </nav>
    <CategoryList
      v-if="!categoryFilter && !rubriquageFilter.length"
      :is-filter="true"
    />
    <RubriqueList
      v-else-if="rubriquageFilter.length !== rubriqueFilter.length"
      :rubriquages="rubriquageFilter"
    />
  </div>
</template>

<script lang="ts">
import { Category } from '@/store/class/general/category';
import { Rubriquage } from '@/store/class/rubrique/rubriquage';
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';
import { Rubrique } from '@/store/class/rubrique/rubrique';
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
  computed: {
    categoryFilter(): Category|undefined{
      return this.$store.state.filter.iab;
    },
    rubriqueFilter(): Array<RubriquageFilter>{
      return this.$store.state.filter.rubriqueFilter;
    },
    isDisplay(): boolean {
      return "homePriv" === this.$route.name ||"home" === this.$route.name ||"podcasts" === this.$route.name||"emissions" === this.$route.name;
    },
    rubriquageFilter(): Array<Rubriquage>{
      if(this.$store.state.filter.organisationId){
        return this.$store.state.filter.rubriquageArray;
      }
      return [];
    }
  },
  methods:{
    onRubriqueSelected(index: number, rubrique: Rubrique): void {
      if(!rubrique ||this.rubriqueFilter[index].rubriqueId === rubrique.rubriqueId){
        return;
      }
      if(rubrique.rubriqueId){
        const filter = Array.from(this.rubriqueFilter);
        filter[index].rubriqueId = rubrique.rubriqueId;
        this.$store.commit('filterRubrique', filter);
        const queries = this.$route.query;
        const queryString = filter.map(value =>  value.rubriquageId+':'+value.rubriqueId).join();
        this.$router.push({ query: { ...queries, ...{ rubriquesId: queryString }} });
      }
    },
    getRubriques(rubriquageId: number): Array<Rubrique>{
      const rubriquage = this.$store.state.filter.rubriquageArray.find((x: Rubriquage) => {
        return x.rubriquageId === rubriquageId;
      });
      if(rubriquage){
        return rubriquage.rubriques;
      }
      return [];
    },
    removeFilter(index: number, event?: { preventDefault: () => void }): void{
      const queries = this.$route.query;
      if(this.categoryFilter){
        if (queries.iabId) {
          this.$router.push({ query: {...queries, ...{iabId: undefined} } });
        }
        this.$store.commit('filterIab', undefined);
      }else{
        const newFilter: Array<RubriquageFilter>  = Array.from(this.$store.state.filter.rubriqueFilter);
        newFilter.splice(index + 1);
        if (queries.rubriquesId) {
          const queryString = newFilter.map(value => value.rubriquageId+':'+value.rubriqueId).join();
          if("" !== queryString){
            this.$router.push({ query: { ...queries, ...{ rubriquesId: queryString }} });
          }else{
            this.$router.push({ query: { ...queries, ...{ rubriquesId: undefined }} });
          }
        }
        this.$store.commit('filterRubrique', newFilter);
      }
      if(event){
        event.preventDefault();
      }
    }
  }
})
</script>