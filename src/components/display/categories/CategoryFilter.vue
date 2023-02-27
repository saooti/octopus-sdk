<template>
  <div
    v-show="isDisplay"
    class="mt-3"
  >
    <ol
      v-if="filterIab || filterRubrique.length"
      class="octopus-breadcrumb d-flex align-items-center flex-wrap"
    >
      <li>
        <a
          href="#"
          @click="removeFilter(-1, $event)"
        >{{ $t('All') }}</a>
      </li>
      <li
        v-if="filterIab"
      >
        {{ filterIab.name }}
      </li>
      <li 
        v-for="(filter, index) in filterRubrique" 
        :key="filter.rubriqueId"
        class="d-flex align-items-center"
        :class="filterRubrique.length-1 === index ? 'active':''"
      >
        <a
          v-if="filterRubrique.length - 1 !== index"
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
  <div
    v-if="!isDisplay"
    class="categary-filter-no-filter"
  />
</template>

<script lang="ts">
import { Rubriquage } from '@/stores/class/rubrique/rubriquage';
import { RubriquageFilter } from '@/stores/class/rubrique/rubriquageFilter';
import { Rubrique } from '@/stores/class/rubrique/rubrique';
import { useFilterStore } from '@/stores/FilterStore';
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
    rubriquageFilter(): Array<Rubriquage>{
      return this.filterOrgaId ? this.filterRubriquage : [];
    },
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
        this.filterUpdateIab(undefined);
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
  .octopus-breadcrumb{
    padding: 1rem;
    align-items: center;
    background: #FAFAFA;
    li{
      list-style: none;
      &:after {
        content: "/";
        margin: 0 0.2rem;
      }
      &:last-child {
        &:after {
          content: "";
        }
      }
    }
  }
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