<template>
  <div
    class="d-flex mt-3 align-items-center"
    v-if="organisationId && rubriquageData"
  >
    <div class="checkbox-saooti flex-shrink">
      <input
        type="checkbox"
        class="custom-control-input"
        id="search-rubriquage-checkbox"
        v-model="isRubriquage"
      />
      <label
        class="custom-control-label"
        for="search-rubriquage-checkbox"
        >{{ $t('By topic') }}</label
      >
    </div>
    <div class="d-flex flex-column" v-if="isRubriquage">
      <RubriqueChoice 
        v-for="(filter, index) in arrayFilter"
        :key="index"
        :index="index"
        :rubriquageDisplay="getRubriquage(index)"
        @updateRubrique="updateRubrique"
        @updateRubriquage="updateRubriquage"
        @deleteRubriqueChoice="deleteRubriqueChoice(index)"
      />
      <button class="btn mt-2" @click="addFilter" v-if="availableRubriquage.length">{{ $t('Add a sort criterion by topic') }}</button>
    </div>
  </div>
</template>
<style lang="scss">
</style>
<script lang="ts">
// @ is an alias to /src
const octopusApi = require('@saooti/octopus-api');
import Vue from 'vue';
import { Rubriquage } from '@/store/class/rubriquage';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
export default Vue.extend({
  components: {
    RubriqueChoice: () => import('./RubriqueChoice.vue'),
  },
  props: {
    organisationId: { default: undefined as string|undefined},
    resetRubriquage: { default: false as boolean},
  },

  data() {
    return {
      isRubriquage: false as boolean,
      rubriquageId: [] as Array<number>,
      rubriqueId: [] as Array<number>,
      arrayFilter: [] as Array<RubriquageFilter>,
      rubriquageData: [] as Array<Rubriquage>,
      reset: false as boolean,
      saveOrganisation: "" as string,
    };
  },

  created() {
    this.fetchTopics();
  },

  computed: {
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    organisation(): string|undefined {
      if (this.organisationId) return this.organisationId;
      if (this.filterOrga) return this.filterOrga;
      return undefined;
    },
    availableRubriquage(): Array<Rubriquage>{
      if(this.arrayFilter.length){
        const rubriquageIdToNotShow = this.arrayFilter.map(a => a.rubriquageId);
        return this.rubriquageData.filter((element)=>{
          return !rubriquageIdToNotShow.includes(element.rubriquageId);
        });
      }
      return this.rubriquageData;
    }
  },
  methods: {
    deleteRubriqueChoice(index: number): void{
      this.arrayFilter.splice(index,1);
    },
    getRubriquage(index: number){
      const elementToNotShow = Array.from(this.arrayFilter);
      elementToNotShow.splice(index, 1);
      if(elementToNotShow.length){
        const rubriquageIdToNotShow = elementToNotShow.map(a => a.rubriquageId);
        return this.rubriquageData.filter((element)=>{
          return !rubriquageIdToNotShow.includes(element.rubriquageId);
        });
      }
      return this.rubriquageData;
    },
    addFilter(): void{
      this.arrayFilter.push({rubriquageId: this.availableRubriquage[0].rubriquageId, rubriqueId: 0, name:""});
    },
    updateRubrique(newValue: {rubriqueId: number; index: number}): void{
      const item = this.arrayFilter[newValue.index];
      item.rubriqueId = newValue.rubriqueId;
      this.arrayFilter.splice(newValue.index, 1, item);
    },
    updateRubriquage(newValue: {rubriquageId: number; index: number}): void{
      const item = this.arrayFilter[newValue.index];
      item.rubriquageId = newValue.rubriquageId;
      this.arrayFilter.splice(newValue.index, 1, item);
    },
    async fetchTopics(): Promise<void> {
      this.arrayFilter.length = 0;
      if (!this.organisation) return;
      if(this.filterOrga){
        this.rubriquageData = this.$store.state.filter.rubriquageArray;
      }else{
        const data = await octopusApi.fetchTopics(this.organisation);
        this.rubriquageData = data.filter((element: Rubriquage)=>{
          return element.rubriques.length;
        });
      }
      this.saveOrganisation = this.organisation;
      if (0 === this.rubriquageData.length) return;
      this.arrayFilter.push({rubriquageId: this.rubriquageData[0].rubriquageId, rubriqueId: 0, name:""});
    }
  },
  watch: {
    organisation(): void {
      if(this.isRubriquage){
        this.fetchTopics();
      }
    },
    isRubriquage(): void {
      if(this.isRubriquage){
        if(this.saveOrganisation !== this.organisation){
          this.fetchTopics();
        }
        this.$emit('updateRubriquageFilter', this.arrayFilter);
      }else{
        this.$emit('updateRubriquageFilter', []);
      }
    },
    arrayFilter(): void{
      if(this.isRubriquage){
        this.$emit('updateRubriquageFilter', this.arrayFilter);
      }
    },
    resetRubriquage(): void {
      this.isRubriquage = false;
    },
  },
});
</script>
