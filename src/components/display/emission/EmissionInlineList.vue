<template>
  <div class="d-flex flex-column p-3 list-episode">
    <div
      v-if="!overflowScroll"
      class="d-flex justify-content-end"
    >
      <div class="hide-phone">
        <button
          class="btn btn-arrow"
          :class="{ disabled: !previousAvailable }"
          :aria-label="$t('Display previous')"
          @click="displayPrevious()"
        >
          <div class="saooti-arrow-left2" />
        </button>
        <button
          class="btn btn-arrow"
          :class="{ disabled: !nextAvailable }"
          :aria-label="$t('Display next')"
          @click="displayNext()"
        >
          <div class="saooti-arrow-right2" />
        </button>
      </div>
    </div>
    <div
      v-if="loading"
      class="d-flex justify-content-center"
    >
      <div class="spinner-border me-3" />
      <h3 class="mt-2">
        {{ $t('Loading emissions ...') }}
      </h3>
    </div>
    <transition-group
      v-show="
        (displayRubriquage && rubriques) || !(displayRubriquage && loaded)
      "
      :name="transitionName"
      class="podcast-list-inline"
      tag="ul"
      :class="[
        alignLeft ? 'justify-content-start' : '',
        overflowScroll ? 'overflowScroll' : '',
      ]"
    >
      <EmissionPlayerItem
        v-for="e in emissions"
        :key="e.emissionId"
        class="flex-shrink item-phone-margin"
        :emission="e"
        :class="[alignLeft ? 'me-3' : '', mainRubriquage(e)]"
        :nb-podcasts="nbPodcasts"
        :rubrique-name="rubriquesId(e)"
      />
    </transition-group>
    <router-link
      v-if="!overflowScroll"
      :to="href"
      class="btn btn-link"
    >
      {{
        buttonText
      }}
    </router-link>
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import domHelper from '../../../helper/dom';
import EmissionPlayerItem from './EmissionPlayerItem.vue';
import { state } from '../../../store/paramStore';

const PHONE_WIDTH = 960;

import { Emission } from '@/store/class/emission';
import { Rubrique } from '@/store/class/rubrique';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'EmissionInlineList',

  components: {
    EmissionPlayerItem,
  },
  props: {
    organisationId: { default: undefined, type: String},
    href: { default: undefined, type: String},
    buttonText: { default: undefined, type: String},
    rubriqueId: { default: undefined, type: Number },
    rubriquageId: { default: undefined, type: Number },
    nbPodcasts: { default: undefined, type: Number },
    itemSize: { default: undefined, type: Number },
  },

  data() {
    return {
      loading: true as boolean,
      loaded: true as boolean,
      index: 0 as number,
      first: 0 as number,
      size: 5 as number,
      totalCount: 0 as number,
      popularSort: true as boolean,
      allEmissions: [] as Array<Emission>,
      direction: 1 as number,
      alignLeft: false as boolean,
      rubriques: undefined as Array<Rubrique>|undefined,
    };
  },


  computed: {
    emissions(): Array<Emission> {
      return this.allEmissions.slice(this.index, this.index + this.size);
    },
    overflowScroll(): boolean {
      return (state.emissionsPage.overflowScroll as boolean);
    },
    previousAvailable(): boolean {
      return this.index > 0;
    },
    nextAvailable(): boolean {
      return this.index + this.size < this.totalCount;
    },
    displayRubriquage(): number|undefined {
      return state.emissionsPage.rubriquage;
    },
    transitionName(): string {
      return this.direction > 0 ? 'out-left' : 'out-right';
    }
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
  methods: {
    async fetchNext(): Promise<void> {
      const data = await octopusApi.fetchEmissions({
        first: this.first,
        size: this.size + 1,
        organisationId: this.organisationId,
        rubriqueId: this.rubriqueId ?  [this.rubriqueId] : [],
        rubriquageId: this.rubriquageId ? [this.rubriquageId] : [],
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
        const nexEl = data.result.pop() as Emission;
        this.preloadImage(nexEl.imageUrl ? nexEl.imageUrl : "");
      }
      this.allEmissions = this.allEmissions.concat(data.result);
      if (this.allEmissions.length <= 3) {
        this.alignLeft = true;
      }
      this.first += this.size;
    },
    displayPrevious(): void {
      this.direction = -1;
      if (this.previousAvailable) {
        this.index -= 1;
      }
    },
    displayNext(): void {
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
    handleResize(): void {
      if (!this.$el) return;
      if (window.innerWidth <= PHONE_WIDTH) {
        this.size = 10;
        return;
      }
      if (this.overflowScroll) {
        this.size = 20;
        return;
      }
      const width = (this.$el as HTMLElement).offsetWidth;
      let sixteen = domHelper.convertRemToPixels(13.7);
      if (this.itemSize) {
        sixteen = domHelper.convertRemToPixels(this.itemSize + 0.7);
      }
      this.size = Math.floor(width / sixteen);
    },
    reset(): void {
      this.loading = true;
      this.loaded = true;
      this.index = 0;
      this.first = 0;
      this.totalCount = 0;
      this.allEmissions.length = 0;
    },
    preloadImage(url: string): void {
      const img = new Image();
      img.src = url;
    },
    async fetchRubriques(): Promise<void> {
      const data = await octopusApi.fetchTopic(this.displayRubriquage);
      this.rubriques = data.rubriques;
    },
    rubriquesId(emission: Emission): string|undefined {
      if (
        !this.displayRubriquage ||
        !emission.rubriqueIds ||
        0 === emission.rubriqueIds.length ||
        !this.rubriques ||
        !this.rubriques.length
      )
        return undefined;
      const rubrique = this.rubriques.find(
        (element: Rubrique) => element.rubriqueId && emission.rubriqueIds.includes(element.rubriqueId) && element.rubriquageId === this.displayRubriquage
      );
      if(rubrique){
        return rubrique.name;
      }
    },
    mainRubriquage(emission: Emission): string {
      if (
        emission.rubriqueIds &&state.emissionsPage.mainRubrique &&
        emission.rubriqueIds.includes(state.emissionsPage.mainRubrique)
      )
        return 'partenaireRubrique';
      return '';
    },
  },
})
</script>

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