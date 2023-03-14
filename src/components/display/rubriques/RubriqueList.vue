<template>
  <div class="d-inline-flex w-100 mb-3 px-3 hide-phone">
    <div
      ref="rubriqueListContainer"
      class="rubrique-list-container"
    >
      <label
        for="rubrique-list-select"
        class="hid"
      >{{ $t('By topic') }}</label>
      <select
        id="rubrique-list-select"
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
        :ref="'rubrique' + rubrique.rubriqueId"
        :key="rubrique.rubriqueId"
        class="rubrique-item bg-white"
        @click="addFilter(rubrique)"
      >
        {{ rubrique.name }}
      </button>
    </div>
    <button
      v-show="hidenRubriques.length"
      id="rubriques-dropdown"
      class="btn admin-button saooti-more"
      :title="$t('See more')"
    />
    <Popover
      target="rubriques-dropdown"
      :only-click="true"
      :is-fixed="true"
      :left-pos="true"
    >
      <RubriqueChooser
        v-if="hidenRubriques.length"
        :multiple="false"
        :rubriquage-id="rubriquage.rubriquageId"
        :all-rubriques="hidenRubriques"
        :cannot-be-undefined="true"
        class="mb-3"
        width="auto"
        @selected="addFilter(index,$event)"
      />
      <button
        v-for="rubrique in hidenRubriques"
        :key="rubrique.rubriqueId"
        class="me-3 octopus-dropdown-item"
        @mousedown="addFilter(rubrique)"
      >
        {{ rubrique.name }}
      </button>
    </Popover>
  </div>
</template>

<script lang="ts">
import Popover from '../../misc/Popover.vue';
import { Rubrique } from '@/stores/class/rubrique/rubrique';
import { Rubriquage } from '@/stores/class/rubrique/rubriquage';
import { RubriquageFilter } from '@/stores/class/rubrique/rubriquageFilter';
import { useFilterStore } from '@/stores/FilterStore';
import { mapState, mapActions } from 'pinia';
import { defineAsyncComponent, defineComponent } from 'vue';
const RubriqueChooser = defineAsyncComponent(() => import('../rubriques/RubriqueChooser.vue'));
export default defineComponent({
  name: 'RubriqueList',

  components:{
    Popover,
    RubriqueChooser
  },

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
    ...mapState(useFilterStore, ['filterRubrique', 'filterRubriqueDisplay']),
    rubriqueDisplay(): Array<Rubrique>{
      return this.filterRubriqueDisplay.filter((rubrique: Rubrique) => 0 !== rubrique.podcastCount );
    },
    rubriquageDisplay(): Array<Rubriquage>{
      const elementToNotShow = Array.from(this.filterRubrique);
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
    filterRubrique:{
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
    ...mapActions(useFilterStore, ['filterUpdateRubrique', 'filterUpdateRubriqueDisplay']),
    initRubriques(): void{
      if(!this.rubriquage){ return ;}
      this.filterUpdateRubriqueDisplay(this.rubriquage.rubriques);
      window.addEventListener('resize', this.resizeWindow);
      this.$nextTick(() => {
        this.resizeWindow();
      });
    },
    addFilter(rubrique: Rubrique): void{
      if(!this.rubriquage){ return ;}
      const filterToAdd = {
        rubriquageId: this.rubriquage.rubriquageId??0, 
        rubriqueId: rubrique.rubriqueId??0, 
        nameRubriquage: this.rubriquage.title,
        nameRubrique: rubrique.name
      };
      const newFilter: Array<RubriquageFilter> = Array.from(this.filterRubrique);
      newFilter.push(filterToAdd);
      this.filterUpdateRubrique(newFilter);
      const queries = this.$route.query;
      const queryString = newFilter.map(value =>  value.rubriquageId+':'+value.rubriqueId).join();
      this.$router.replace({ query: { ...queries, ...{ rubriquesId: queryString }} });
      this.selectNewRubriquage();
    },
    selectNewRubriquage(){
      const rubriquageLength = this.rubriquages.length;
      if(rubriquageLength === this.filterRubrique.length){
        return;
      }
      let index = 0;
      const rubriquageAlreadyFilter = this.filterRubrique.map(a => a.rubriquageId);
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
      const rubriqueList = (this.$refs.rubriqueListContainer as HTMLElement);
      if(null === rubriqueList){return}
      rubriqueList.style.justifyContent = 'flex-start';
      this.hidenRubriques.length = 0;
      this.rubriqueDisplay.forEach((element: Rubrique) => {
        const el = (this.$refs['rubrique' + element.rubriqueId] as Array<HTMLElement>)[0];
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