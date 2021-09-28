<template>
  <div v-if="isDisplay">
    <nav aria-label="breadcrumb" v-if="categoryFilter || rubriqueFilter.length">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="#" @click="removeFilter(-1, $event)">{{$t('All')}}</a></li>
        <li class="breadcrumb-item active" v-if="categoryFilter">{{ categoryFilter.name }}</li>
        <li 
          class="breadcrumb-item" 
          :class="rubriqueFilter.length-1 === index ? 'active':''"
          v-for="(filter, index) in rubriqueFilter"
          :key="filter.rubriqueId"
        >
          <a href="#" @click="removeFilter(index,$event)" v-if="rubriqueFilter.length - 1 !== index">{{ filter.name }}</a>
          <template v-else>{{ filter.name }}</template>
        </li>
      </ol>
    </nav>
    <CategoryList :isFilter="true" v-if="!categoryFilter && !rubriquageFilter.length"/>
    <RubriqueList :rubriquages="rubriquageFilter"  v-else-if="rubriquageFilter.length !== rubriqueFilter.length"/>
  </div>
</template>

<style lang="scss">

</style>
<script lang="ts">
import { Category } from '@/store/class/category';
import { Rubriquage } from '@/store/class/rubriquage';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
export default{
  name: 'CategoryFilter',

  components:{
    CategoryList: () => import('./CategoryList.vue') as any,
    RubriqueList: () => import('./../rubriques/RubriqueList.vue') as any,
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
};
</script>
