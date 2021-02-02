<template>
  <div class="d-flex flex-column align-items-center">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading emissions ...') }}</h3>
    </div>
    <div v-if="showCount && loaded && emissions.length > 1" class="text-secondary mb-2">{{$t('Number emissions',{nb :displayCount}) + sortText}}</div>
    <ul class="emission-list" :class="smallItems? 'threeEmissions': 'twoEmissions'" v-if="!itemPlayer">
      <EmissionItem
        v-bind:emission="e"
        v-for="e in emissions"
        v-bind:key="e.emissionId"
        @emissionNotVisible="displayCount--"
      />
    </ul>
    <ul class="d-flex flex-wrap justify-content-around" v-show="(displayRubriquage && rubriques) || !(displayRubriquage &&loaded)" v-else>
      <EmissionPlayerItem
        v-bind:emission="e"
        v-for="e in emissions"
        v-bind:key="e.emissionId"
        class="m-3 flex-shrink"
        :class="mainRubriquage(e)" 
        :rubriqueName="rubriquesId(e)"
        @emissionNotVisible="displayCount--"
      />
    </ul>
    <button
      class="btn"
      :class="buttonPlus? 'btn-linkPlus': 'btn-more'"
      @click="displayMore"
      :disabled="inFetching"
      v-show="!allFetched && loaded"
      :aria-label="$t('See more')"
    >
      <template v-if="buttonPlus">{{$t('See more')}}</template>
      <div class="saooti-plus"></div>
    </button>
  </div>
</template>

<style lang="scss">
.loading-title {
  margin: 0.4rem 0 0;
}
.emission-list {
  align-self: stretch;
  flex-grow: 1;
  margin: 0;
  padding: 0;
  /*For ie11 */
  display: flex;
  flex-wrap: wrap;
  /* end */

  display: grid; /* 1 */
  grid-gap: 1rem; /* 3 */
  justify-content: space-between; /* 4 */
}
.twoEmissions{
  grid-template-columns: repeat(auto-fill, 49%); /* 2 */
}

.threeEmissions{
  grid-template-columns: repeat(auto-fill, 32%); /* 2 */
}

/** PHONES*/
@media (max-width: 1200px) {
  .emission-list {
    grid-template-columns: auto;
  }
}
</style>

<script>
import octopusApi from "@saooti/octopus-api";
import emissionApi from '@/api/emissions';
import EmissionItem from './EmissionItem.vue';
import EmissionPlayerItem from './EmissionPlayerItem.vue';
import {state} from "../../../store/paramStore.js";

export default {
  name: 'EmissionList',

  props: ['first', 'size', 'query', 'organisationId', 'monetization','rubriqueId', 'rubriquageId', 'before', 'after', 'sort', 'showCount', 'noRubrique','includeHidden'],

  components: {
    EmissionItem,
    EmissionPlayerItem
  },

  mounted() {
    this.fetchContent(true);
    if(this.displayRubriquage){
      this.fetchRubriques();
    }
  },

  data() {
    return {
      loading: true,
      loaded: true,
      dfirst: this.$props.first,
      dsize: this.$props.size,
      totalCount: 0,
      displayCount:0,
      emissions: [],
      rubriques:undefined,
      inFetching: false,
    };
  },

  computed: {
    allFetched() {
      return this.dfirst >= this.totalCount;
    },
    buttonPlus(){
      return state.generalParameters.buttonPlus;
    },
    smallItems(){
      return state.emissionsPage.smallItems;
    },
    itemPlayer(){
      return state.emissionsPage.itemPlayer;
    },
    displayRubriquage(){
      return state.emissionsPage.rubriquage;
    },
    changed(){
      return `${this.first}|${this.size}|${this.organisationId}|${this.query}|${this.monetization}|${this.includeHidden}
      ${this.rubriqueId}|${this.rubriquageId}|${this.before}|${this.after}|${this.sort}|${this.noRubrique}`;
    },
    sortText(){
      switch (this.sort) {
        case "SCORE": return this.$t('sort by score');
        case "LAST_PODCAST_DESC":return this.$t('sort by date');
        case "NAME":return this.$t('sort by alphabetical');
        default:return this.$t('sort by date');
      }
    },
    filterOrga(){
      return this.$store.state.filter.organisationId;
    },
    organisation(){
      if(this.organisationId)
        return this.organisationId;
      if(this.filterOrga)
        return this.filterOrga;
      return undefined;
    },
  },

  methods: {
    async fetchContent(reset) {
      this.inFetching=true;
      var self = this;
      if (reset) {
        self.$data.emissions = [];
        self.$data.dfirst = 0;
        self.$data.loading = true;
        self.$data.loaded = false;
      }
      let param = {
        first: self.dfirst,
        size: self.dsize,
        query: self.query,
        organisationId: self.organisation,
        monetisable: self.monetization,
        rubriqueId: self.rubriqueId,
        rubriquageId: self.rubriquageId,
        before: this.before,
        after: this.after,
        sort: this.sort,
        noRubrique: this.noRubrique,
      }
      if(this.includeHidden){
        param.includeHidden = this.includeHidden;
        const data = await emissionApi.fetchEmissionsAdmin(this.$store, param);
        this.afterFetching(reset, data);
      }else{
        const data = await octopusApi.fetchEmissions(param);
        this.afterFetching(reset, data);
      }
    },
    
    afterFetching(reset, data){
      if (reset) {
        this.emissions = [];
        this.dfirst = 0;
      }
      this.loading = false;
      this.loaded = true;
      this.displayCount = data.count;
      this.emissions = this.emissions.concat(data.result).filter((e)=>{
        if(e===null){
          this.displayCount--;
        }
        return e!== null;
      });
      this.dfirst += this.dsize;
      this.totalCount = data.count;
      this.inFetching=false;
    },

    displayMore(event) {
      event.preventDefault();
      this.fetchContent(false);
    },
    async fetchRubriques(){
      const data = await octopusApi.fetchTopic(this.displayRubriquage);
      this.rubriques = data.rubriques; 
    },
    mainRubriquage(emission){
      if(emission.rubriqueIds && emission.rubriqueIds[0] === state.emissionsPage.mainRubrique)
        return "partenaireRubrique";
      return "";
    },
    rubriquesId(emission){
      if(!this.displayRubriquage || !emission.rubriqueIds || emission.rubriqueIds.length === 0 || !this.rubriques || !this.rubriques.length)
        return undefined;
      let rubrique = this.rubriques.find(element => element.rubriqueId === emission.rubriqueIds[0]);
      return rubrique.name;
    },
  },

  watch: {
    changed:{
       handler() {
        this.fetchContent(true);
      },
    },
  },
};
</script>
