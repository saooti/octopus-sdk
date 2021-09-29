<template>
  <div v-if="isDisplay">
    <nav
      v-if="categoryFilter || rubriqueFilter.length"
      aria-label="breadcrumb"
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
          class="breadcrumb-item"
          :class="rubriqueFilter.length-1 === index ? 'active':''"
        >
          <a
            v-if="rubriqueFilter.length - 1 !== index"
            href="#"
            @click="removeFilter(index,$event)"
          >{{ filter.name }}</a>
          <template v-else>
            {{ filter.name }}
          </template>
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
import { Category } from '@/store/class/category';
import { Rubriquage } from '@/store/class/rubriquage';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
import { defineComponent, defineAsyncComponent } from 'vue';
const CategoryList = defineAsyncComponent(() => import('./CategoryList.vue'));
const RubriqueList = defineAsyncComponent(() => import('./../rubriques/RubriqueList.vue'));
export default defineComponent({
  name: 'CategoryFilter',

  components:{
    CategoryList,
    RubriqueList,
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
})
</script>

<style lang="scss"></style>