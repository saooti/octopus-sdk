<template>
  <div class="d-flex flex-column align-items-center">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading emissions ...') }}</h3>
    </div>
    <div
      v-if="showCount && loaded && emissions.length > 1"
      class="text-secondary mb-2"
    >
      {{ $t('Number emissions', { nb: displayCount }) + sortText }}
    </div>
    <ul
      class="emission-list"
      :class="smallItems ? 'threeEmissions' : 'twoEmissions'"
      v-if="!itemPlayer"
    >
      <EmissionItem
        v-bind:emission="e"
        v-for="e in emissions"
        v-bind:key="e.emissionId"
        @emissionNotVisible="displayCount--"
      />
    </ul>
    <ul
      class="d-flex flex-wrap justify-content-around"
      v-show="
        (displayRubriquage && rubriques) || !(displayRubriquage && loaded)
      "
      v-else
    >
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
      :class="buttonPlus ? 'btn-linkPlus' : 'btn-more'"
      @click="displayMore"
      :disabled="inFetching"
      v-show="!allFetched && loaded"
      :aria-label="$t('See more')"
    >
      <template v-if="buttonPlus">{{ $t('See more') }}</template>
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
.twoEmissions {
  grid-template-columns: repeat(auto-fill, 49%); /* 2 */
}

.threeEmissions {
  grid-template-columns: repeat(auto-fill, 32%); /* 2 */
}

/** PHONES*/
@media (max-width: 1200px) {
  .emission-list {
    grid-template-columns: auto;
  }
}
</style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import emissionApi from '@/api/emissions';
import EmissionItem from './EmissionItem.vue';
import EmissionPlayerItem from './EmissionPlayerItem.vue';
import store from '@/store/AppStore';
import { state } from '../../../store/paramStore.js';

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'EmissionList',

  props: [
    'first',
    'size',
    'query',
    'organisationId',
    'monetization',
    'rubriqueId',
    'rubriquageId',
    'before',
    'after',
    'sort',
    'showCount',
    'noRubrique',
    'includeHidden',
  ],

  components: {
    EmissionItem,
    EmissionPlayerItem,
  },

  mounted() {
    this.fetchContent(true);
    if (this.displayRubriquage) {
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
      displayCount: 0,
      emissions: [] as any,
      rubriques: undefined as any,
      inFetching: false,
    };
  },

  computed: {
    allFetched():boolean {
      return this.dfirst >= this.totalCount;
    },
    buttonPlus() {
      return state.generalParameters.buttonPlus;
    },
    smallItems() {
      return state.emissionsPage.smallItems;
    },
    itemPlayer() {
      return state.emissionsPage.itemPlayer;
    },
    displayRubriquage() {
      return state.emissionsPage.rubriquage;
    },
    changed():any {
      return `${this.first}|${this.size}|${this.organisationId}|${this.query}|${this.monetization}|${this.includeHidden}
      ${this.rubriqueId}|${this.rubriquageId}|${this.before}|${this.after}|${this.sort}|${this.noRubrique}`;
    },
    sortText():string {
      switch (this.sort) {
        case 'SCORE':
          return this.$t('sort by score');
        case 'LAST_PODCAST_DESC':
          return this.$t('sort by date');
        case 'NAME':
          return this.$t('sort by alphabetical');
        default:
          return this.$t('sort by date');
      }
    },
    filterOrga() {
      return store.state.filter.organisationId;
    },
    organisation():any {
      if (this.organisationId) return this.organisationId;
      if (this.filterOrga) return this.filterOrga;
      return undefined;
    },
  },

  methods: {
    async fetchContent(reset: boolean) {
      this.inFetching = true;
      if (reset) {
        this.emissions.length = 0;
        this.dfirst = 0;
        this.loading = true;
        this.loaded = false;
      }
      let param:any = {
        first: this.dfirst,
        size: this.dsize,
        query: this.query,
        organisationId: this.organisation,
        monetisable: this.monetization,
        rubriqueId: this.rubriqueId,
        rubriquageId: this.rubriquageId,
        before: this.before,
        after: this.after,
        sort: this.sort,
        noRubrique: this.noRubrique,
      };
      if (this.includeHidden) {
        param.includeHidden = this.includeHidden;
        const data = await emissionApi.fetchEmissionsAdmin(store, param);
        this.afterFetching(reset, data);
      } else {
        const data = await octopusApi.fetchEmissions(param);
        this.afterFetching(reset, data);
      }
    },

    afterFetching(reset: any, data: any) {
      if (reset) {
        this.emissions.length = 0;
        this.dfirst = 0;
      }
      this.loading = false;
      this.loaded = true;
      this.displayCount = data.count;
      this.emissions = this.emissions.concat(data.result).filter((e:any) => {
        if (null === e) {
          this.displayCount--;
        }
        return null !== e;
      });
      this.dfirst += this.dsize;
      this.totalCount = data.count;
      this.inFetching = false;
    },

    displayMore(event: { preventDefault: () => void; }) {
      event.preventDefault();
      this.fetchContent(false);
    },
    async fetchRubriques() {
      const data = await octopusApi.fetchTopic(this.displayRubriquage);
      this.rubriques = data.rubriques;
    },
    mainRubriquage(emission: { rubriqueIds: any[]; }) {
      if (
        emission.rubriqueIds &&
        emission.rubriqueIds[0] === state.emissionsPage.mainRubrique
      )
        return 'partenaireRubrique';
      return '';
    },
    rubriquesId(emission: { rubriqueIds: string|any[]; }) {
      if (
        !this.displayRubriquage ||
        !emission.rubriqueIds ||
        0 === emission.rubriqueIds.length ||
        !this.rubriques ||
        !this.rubriques.length
      )
        return undefined;
      let rubrique = this.rubriques.find(
        (        element: { rubriqueId: any; }) => element.rubriqueId === emission.rubriqueIds[0]
      );
      return rubrique.name;
    },
  },

  watch: {
    changed: {
      handler() {
        this.fetchContent(true);
      },
    },
  },
});
</script>
