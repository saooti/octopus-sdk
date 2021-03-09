<template>
  <div class="d-flex flex-column p-3 list-episode">
    <div class="d-flex justify-content-end" v-if="!overflowScroll">
      <div class="hide-phone">
        <button
          class="btn btn-arrow"
          @click="displayPrevious()"
          :class="{ disabled: !previousAvailable }"
          :aria-label="$t('Display previous')"
        >
          <div class="saooti-arrow-left2"></div>
        </button>
        <button
          class="btn btn-arrow"
          @click="displayNext()"
          :class="{ disabled: !nextAvailable }"
          :aria-label="$t('Display next')"
        >
          <div class="saooti-arrow-right2"></div>
        </button>
      </div>
    </div>
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border mr-3"></div>
      <h3 class="mt-2">{{ $t('Loading emissions ...') }}</h3>
    </div>
    <transition-group
      :name="transitionName"
      class="podcast-list-inline"
      tag="ul"
      v-show="
        (displayRubriquage && rubriques) || !(displayRubriquage && loaded)
      "
      :class="[
        alignLeft ? 'justify-content-start' : '',
        overflowScroll ? 'overflowScroll' : '',
      ]"
    >
      <EmissionPlayerItem
        class="flex-shrink item-phone-margin"
        :emission="e"
        v-for="e in emissions"
        v-bind:key="e.emissionId"
        :class="[alignLeft ? 'mr-3' : '', mainRubriquage(e)]"
        :nbPodcasts="nbPodcasts"
        :rubriqueName="rubriquesId(e)"
      />
    </transition-group>
    <router-link v-bind:to="href" class="btn btn-link" v-if="!overflowScroll">{{
      buttonText
    }}</router-link>
  </div>
</template>

<style lang="scss">
.podcast-list-inline.overflowScroll {
  display: flex;
  flex-wrap: wrap;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  padding-bottom: 1rem;
  width: 100%;
  height: 80vh;
  overflow-y: auto;
  @media (max-width: 960px) {
    overflow-x: hidden;
    flex-direction: column;
    flex-wrap: nowrap;
  }
  .item-phone-margin {
    margin: 1rem 0.5rem !important;
  }
}
</style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');
import domHelper from '../../../helper/dom';
import EmissionPlayerItem from './EmissionPlayerItem.vue';
import { state } from '../../../store/paramStore';

const PHONE_WIDTH = 960;

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'EmissionInlineList',

  props: [
    'organisationId',
    'href',
    'buttonText',
    'rubriqueId',
    'rubriquageId',
    'nbPodcasts',
    'itemSize',
  ],

  components: {
    EmissionPlayerItem,
  },

  created() {
    window.addEventListener('resize', this.handleResize);
  },

  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },

  mounted() {
    this.handleResize();
    this.fetchNext();
    if (this.displayRubriquage) {
      this.fetchRubriques();
    }
  },

  data() {
    return {
      loading: true,
      loaded: true,
      index: 0,
      first: 0,
      size: 5,
      totalCount: 0,
      popularSort: true,
      allEmissions: [] as any,
      direction: 1,
      alignLeft: false,
      rubriques: undefined as any,
    };
  },

  computed: {
    emissions():any {
      return this.allEmissions.slice(this.index, this.index + this.size);
    },
    overflowScroll() {
      return state.emissionsPage.overflowScroll;
    },
    previousAvailable():boolean {
      return this.index > 0;
    },
    nextAvailable():boolean {
      return this.index + this.size < this.totalCount;
    },
    displayRubriquage() {
      return state.emissionsPage.rubriquage;
    },
    transitionName: ({ direction }:any) =>
      direction > 0 ? 'out-left' : 'out-right',
  },

  methods: {
    async fetchNext() {
      const data = await octopusApi.fetchEmissions({
        first: this.first,
        size: this.size + 1,
        organisationId: this.organisationId,
        rubriqueId: this.rubriqueId,
        rubriquageId: this.rubriquageId,
        sort: 'LAST_PODCAST_DESC',
      });
      this.loading = false;
      this.loaded = true;
      this.totalCount = data.count;
      /* if(this.first === 0 && this.displayRubriquage && state.emissionsPage.mainRubrique){
        data.result.sort((a, b)=>{
          if (a.rubriqueIds[0] === state.emissionsPage.mainRubrique)
            return 1;
          if (b.rubriqueIds[0] === state.emissionsPage.mainRubrique)
            return -1;
          return 0;
        });
      } */
      if (this.allEmissions.length + data.result.length < this.totalCount) {
        let nexEl = data.result.pop();
        this.preloadImage(nexEl.imageUrl);
      }
      this.allEmissions = this.allEmissions.concat(data.result);
      if (this.allEmissions.length <= 3) {
        this.alignLeft = true;
      }
      this.first += this.size;
    },

    displayPrevious() {
      this.direction = -1;
      if (this.previousAvailable) {
        this.index -= 1;
      }
    },

    displayNext() {
      this.direction = 1;
      if (!this.nextAvailable) return;
      if (
        this.first - (this.index + this.size) < 2 &&
        this.allEmissions.length < this.totalCount
      ) {
        this.fetchNext();
      }
      this.index += 1;
    },

    handleResize() {
      if (!this.$el) return;
      if (window.innerWidth <= PHONE_WIDTH) {
        this.size = 10;
        return;
      }
      if (this.overflowScroll) {
        this.size = 20;
        return;
      }
      const width = this.$el.offsetWidth;
      let sixteen = domHelper.convertRemToPixels(13.7);
      if (this.itemSize) {
        sixteen = domHelper.convertRemToPixels(this.itemSize + 0.7);
      }
      this.size = Math.floor(width / sixteen);
    },

    reset() {
      this.loading = true;
      this.loaded = true;
      this.index = 0;
      this.first = 0;
      this.totalCount = 0;
      this.allEmissions.length = 0;
    },

    preloadImage(url: string) {
      let img = new Image();
      img.src = url;
    },
    async fetchRubriques() {
      const data = await octopusApi.fetchTopic(this.displayRubriquage);
      this.rubriques = data.rubriques;
    },
    rubriquesId(emission:any) {
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
    mainRubriquage(emission: { rubriqueIds: any[]; }) {
      if (
        emission.rubriqueIds &&
        emission.rubriqueIds[0] === state.emissionsPage.mainRubrique
      )
        return 'partenaireRubrique';
      return '';
    },
  },
});
</script>
