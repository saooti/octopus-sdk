<template>
  <div class="d-inline-flex w-100 mb-3 px-3 hide-phone">
    <div
      id="rubrique-list-container"
    >
      <select
        v-model="rubriquage"
        class="c-hand"
        @change="onRubriquageSelected"
      >
        <option
          v-for="myRubriquage in rubriquageDisplay"
          :key="myRubriquage.rubriquageId"
          :value="myRubriquage"
        >
          {{ myRubriquage.title }}
        </option>
      </select>
      <button
        v-for="rubrique in rubriqueDisplay"
        :id="'rubrique' + rubrique.rubriqueId"
        :key="rubrique.rubriqueId"
        class="rubrique-item bg-white"
        @click="addFilter(rubrique)"
      >
        {{ rubrique.name }}
      </button>
    </div>
    <div
      v-show="hidenRubriques.length"
      class="dropdown btn-group"
    >
      <button
        class="btn dropdown-toggle admin-button dropdown-toggle-no-caret saooti-more"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        :title="$t('See more')"
      />
      <ul class="dropdown-menu dropdown-menu-right px-4">
        <div
          v-for="rubrique in hidenRubriques"
          :key="rubrique.rubriqueId"
          class="me-3 dropdown-item"
          @click="addFilter(rubrique)"
        >
          {{ rubrique.name }}
        </div>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Rubrique } from '@/store/class/rubrique/rubrique';
import { Rubriquage } from '@/store/class/rubrique/rubriquage';
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'RubriqueList',

  props: {
    rubriquages: { default: () => [], type: Array as ()=>Array<Rubriquage>},
  },

  data() {
    return {
      hidenRubriques: [] as Array<Rubrique>,
      rubriques: [] as Array<Rubrique>,
      rubriquage: undefined as Rubriquage|undefined,
    };
  },

  computed: {
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    rubriqueFilter(): Array<RubriquageFilter>{
      return this.$store.state.filter.rubriqueFilter;
    },
    rubriqueDisplay(): Array<Rubrique>{
      return this.$store.state.filter.rubriqueDisplay.filter((rubrique: Rubrique) => 0 !== rubrique.podcastCount );
    },
    rubriquageDisplay(): Array<Rubriquage>{
      const elementToNotShow = Array.from(this.rubriqueFilter);
      if(elementToNotShow.length){
        const rubriquageIdToNotShow = elementToNotShow.map(a => a.rubriquageId);
        return this.rubriquages.filter((element)=>{
          if(!element.rubriquageId){return;}
          return !rubriquageIdToNotShow.includes(element.rubriquageId);
        });
      }
      return this.rubriquages;
    },
  },
  watch:{
    rubriqueFilter:{
      deep: true,
      handler(){
        this.selectNewRubriquage();
      }
    }
  },

  mounted() {
    this.selectNewRubriquage();
  },
  beforeUnmount(): void {
    window.removeEventListener('resize', this.resizeWindow);
  },
  methods: {
    
    initRubriques(): void{
      if(!this.rubriquage){ return ;}
      this.$store.commit('filterRubriqueDisplay', this.rubriquage.rubriques);
      window.addEventListener('resize', this.resizeWindow);
      this.$nextTick(() => {
        this.resizeWindow();
      });
    },
    addFilter(rubrique: Rubrique): void{
      if(!this.rubriquage){ return ;}
      const filterToAdd = {
        rubriquageId: this.rubriquage.rubriquageId?this.rubriquage.rubriquageId: 0, 
        rubriqueId: rubrique.rubriqueId? rubrique.rubriqueId:0, 
        nameRubriquage: this.rubriquage.title,
        nameRubrique: rubrique.name
      };
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
        const rubriquageIdIndex = this.rubriquages[index].rubriquageId;
        if(rubriquageIdIndex && !rubriquageAlreadyFilter.includes(rubriquageIdIndex)){
          break;
        }
      }
      this.rubriquage = this.rubriquages[index];
      this.initRubriques();
    },
    resizeWindow(): void {
      const rubriqueList = document.getElementById('rubrique-list-container');
      if(null === rubriqueList){return}
      rubriqueList.style.justifyContent = 'flex-start';
      this.hidenRubriques.length = 0;
      this.rubriqueDisplay.forEach((element: Rubrique) => {
        const el = document.getElementById('rubrique' + element.rubriqueId);
        if (!el) return;
        const parent = el.parentElement;
        if (null !== parent && el.offsetLeft + el.clientWidth <= parent.clientWidth - 20) {
          el.classList.remove('hid');
          return;
        }
        this.hidenRubriques.push(element);
        if (!el.classList.contains('hid')) {
          el.className += ' hid';
        }
      });
      if (!this.hidenRubriques.length) {
        rubriqueList.style.justifyContent = 'center';
      }
    },
    onRubriquageSelected(){
      this.initRubriques();
    }
  }
})
</script>

<style lang="scss">
.octopus-app{
#rubrique-list-container {
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
    padding: 0.5rem;
  }
}
.rubrique-item {
  font-size: 0.6rem;
  margin: 0.2rem;
  padding: 0.5rem;
  border-radius: 1.5rem;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover {
    background: #eee !important;
  }
}
}
</style>