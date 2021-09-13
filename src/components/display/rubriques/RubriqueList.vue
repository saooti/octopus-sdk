<template>
  <div class="d-inline-flex w-100 mb-3 pl-3 pr-3 hide-phone rubrique-list">
    <div class="rubrique-list-container" id="rubrique-list-container">
      <select
        class="basic-select border c-hand"
        v-model="rubriquage"
        @change="onRubriquageSelected"
      >
        <option
          v-for="rubriquage in rubriquages"
          :key="rubriquage.rubriquageId"
          :value="rubriquage"
          >{{ rubriquage.title }}</option
        >
      </select>
      <button
        :id="'rubrique' + rubrique.rubriqueId"
        @click="addFilter(rubrique)"
        class="rubrique-item"
        v-for="rubrique in rubriqueDisplay"
        :key="rubrique.rubriqueId"
        >{{ rubrique.name }}</button
      >
    </div>
    <b-dropdown
      v-show="hidenRubriques.length"
      right
      toggle-class="text-decoration-none text-dark rubrique-item rubrique-item-plus"
      no-caret
      :aria-label="$t('See more')"
    >
      <template v-slot:button-content>
        <i :aria-label="$t('See more')" class="saooti-plus"></i>
      </template>
      <template>
        <b-dropdown-item
          @click="addFilter(rubrique)"
          v-for="rubrique in hidenRubriques"
          v-bind:key="rubrique.rubriqueId"
          class="mr-3"
          >{{ rubrique.name }}</b-dropdown-item
        >
      </template>
    </b-dropdown>
  </div>
</template>

<style lang="scss">
.rubrique-list-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  flex-grow: 1;
  width: 0;
  padding: 0 4rem;
  select{
    width: auto;
    border-radius: 1.5rem;
    margin: 0.2rem;
    font-size: 0.6rem;
    margin: 0.2rem;
    padding: 0.5rem;
  }
}
.rubrique-item {
  font-size: 0.6rem;
  margin: 0.2rem;
  padding: 0.5rem;
  display: block;
  height: 1.5rem;
  border-radius: 1.5rem;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex-shrink: 0;
}
button.rubrique-item {
  .router-link-active {
    background: #ddd !important;
  }
  &:hover {
    background: #ddd !important;
  }
}

.rubrique-list .rubrique-item-plus {
  display: flex;
  height: 1.5rem;
  width: 1.5rem;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
}
</style>
<script lang="ts">
import Vue from 'vue';
import { Rubrique } from '@/store/class/rubrique';
import { Rubriquage } from '@/store/class/rubriquage';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
export default Vue.extend({
  name: 'RubriqueList',

  props: {
    rubriquages: { default: () => ([]) as Array<Rubriquage>},
  },

  data() {
    return {
      hidenRubriques: [] as Array<Rubrique>,
      rubriques: [] as Array<Rubrique>,
      rubriquage: undefined as Rubriquage|undefined,
    };
  },

  mounted() {
    this.selectNewRubriquage();
  },

  computed: {
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    rubriqueFilter(): Array<RubriquageFilter>{
      return this.$store.state.filter.rubriqueFilter;
    },
    rubriqueDisplay(): Array<Rubrique>{
      return this.$store.state.filter.rubriqueDisplay;
    },
  },
  methods: {
    initRubriques(): void{
      if(!this.rubriquage){ return ;}
      this.$store.commit('filterRubriqueDisplay', this.rubriquage.rubriques);
      window.addEventListener('resize', this.resizeWindow);
      this.resizeWindow();
    },
    addFilter(rubrique: Rubrique): void{
      if(!this.rubriquage){ return ;}
      const filterToAdd = {rubriquageId: this.rubriquage.rubriquageId!, rubriqueId: rubrique.rubriqueId!, name: this.rubriquage.title +": "+rubrique.name};
      const newFilter: Array<RubriquageFilter> = Array.from(this.$store.state.filter.rubriqueFilter);
      newFilter.push(filterToAdd);
      this.$store.commit('filterRubrique', newFilter);
      const queries = this.$route.query;
      const queryString = newFilter.map(value =>  value.rubriquageId+':'+value.rubriqueId).join();
      this.$router.push({ query: { ...queries, ...{ rubriquesId: queryString }} });
      this.selectNewRubriquage();
    },
    selectNewRubriquage(){
      const rubriquageLength = this.rubriquages.length;
      if(rubriquageLength === this.rubriqueFilter.length){
        return;
      }
      let index = 0;
      const rubriquageAlreadyFilter = this.rubriqueFilter.map(a => a.rubriquageId);
      for (index; index < rubriquageLength; index++) {
        if(!rubriquageAlreadyFilter.includes(this.rubriquages[index].rubriquageId!)){
          break;
        }
      }
      this.rubriquage = this.rubriquages[index];
      this.initRubriques();
    },
    resizeWindow(): void {
      const rubriqueList = document.getElementById('rubrique-list-container');
      rubriqueList!.style.justifyContent = 'flex-start';
      this.hidenRubriques.length = 0;
      this.rubriqueDisplay.forEach((element: Rubrique) => {
        const el = document.getElementById('rubrique' + element.rubriqueId);
        if (!el) return;
        const parent = el.parentElement;
        if (el.offsetLeft + el.clientWidth <= parent!.clientWidth - 20) {
          el.classList.remove('hid');
          return;
        }
        this.hidenRubriques.push(element);
        if (!el.classList.contains('hid')) {
          el.className += ' hid';
        }
      });
      if (!this.hidenRubriques.length) {
        rubriqueList!.style.justifyContent = 'center';
      }
    },
    onRubriquageSelected(){
      this.initRubriques();
    }
  },
  beforeDestroy(): void {
    window.removeEventListener('resize', this.resizeWindow);
  },
  watch:{
    rubriqueFilter(): void{
      this.selectNewRubriquage();
    }
  }
});
</script>
