<template>
  <div
    v-show="isDisplay"
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
      :is-display="isDisplay"
      @categoriesLength="checkIfCategories"
    />
    <RubriqueList
      v-else-if="isDisplay && rubriquageFilter.length !== rubriqueFilter.length"
      :rubriquages="rubriquageFilter"
    />
  </div>
  <div
    v-if="!isDisplay"
    class="categary-filter-no-filter"
  />
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
  data() {
    return {
      isCategories: false as boolean,
    };
  },
  computed: {
    categoryFilter(): Category|undefined{
      return this.$store.state.filter.iab;
    },
    rubriqueFilter(): Array<RubriquageFilter>{
      return this.$store.state.filter.rubriqueFilter;
    },
    isDisplay(): boolean {
      return ("homePriv" === this.$route.name ||"home" === this.$route.name ||"podcasts" === this.$route.name||"emissions" === this.$route.name) 
      && (this.isCategories || undefined!==this.categoryFilter || 0!==this.rubriqueFilter.length || 0!==this.rubriquageFilter.length);
    },
    rubriquageFilter(): Array<Rubriquage>{
      return this.$store.state.filter.organisationId ? this.$store.state.filter.rubriquageArray : [];
    },
  },
  methods:{
    checkIfCategories(length: number): void{
      this.isCategories = 0!==length;
    },
    onRubriqueSelected(index: number, rubrique: Rubrique): void {
      if(!rubrique ||this.rubriqueFilter[index].rubriqueId === rubrique.rubriqueId ||rubrique.rubriqueId){
        return;
      }
      const filter = Array.from(this.rubriqueFilter);
      filter[index].rubriqueId = rubrique.rubriqueId||0;
      this.$store.commit('filterRubrique', filter);
      const queryString = filter.map(value =>  value.rubriquageId+':'+value.rubriqueId).join();
      this.$router.replace({ query: { ...this.$route.query, ...{ rubriquesId: queryString }} });
    },
    getRubriques(rubriquageId: number): Array<Rubrique>{
      const rubriquage = this.$store.state.filter.rubriquageArray.find((x: Rubriquage) => {
        return x.rubriquageId === rubriquageId;
      });
      return rubriquage ? rubriquage.rubriques : [];
    },
    removeFilter(index: number, event?: { preventDefault: () => void }): void{
      if(this.categoryFilter){
        if (this.$route.query.iabId) {
          this.$router.replace({ query: {...this.$route.query, ...{iabId: undefined} } });
        }
        this.$store.commit('filterIab', undefined);
      }else{
        const newFilter: Array<RubriquageFilter>  = Array.from(this.$store.state.filter.rubriqueFilter);
        newFilter.splice(index + 1);
        if (this.$route.query.rubriquesId) {
          const queryString = newFilter.map(value => value.rubriquageId+':'+value.rubriqueId).join();
          this.$router.replace({ query: { ...this.$route.query, ...{ rubriquesId:"" !== queryString? queryString : undefined}} });
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
<style lang="scss">
.octopus-app{
  .categary-filter-no-filter{
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