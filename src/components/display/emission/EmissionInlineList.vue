<template>
  <div class="d-flex flex-column p-3 list-episode">
    <div
      v-if="!overflowScroll"
      class="d-flex justify-content-end"
    >
      <div class="hide-phone">
        <button
          class="btn admin-button m-1 saooti-left"
          :class="{ disabled: !previousAvailable }"
          :title="$t('Display previous')"
          @click="displayPrevious()"
        />
        <button
          class="btn admin-button m-1 saooti-right"
          :class="{ disabled: !nextAvailable }"
          :title="$t('Display next')"
          @click="displayNext()"
        />
      </div>
    </div>
    <ClassicLoading
      :loading-text="loading?$t('Loading emissions ...'):undefined"
    />
    <transition-group
      v-show="
        (displayRubriquage && rubriques) || !(displayRubriquage && loaded)
      "
      :name="transitionName"
      class="element-list-inline"
      tag="div"
      :class="[
        alignLeft ? 'justify-content-start' : '',
        overflowScroll ? 'overflowScroll' : '',
      ]"
      :css="isInlineAnimation"
    >
      <EmissionPlayerItem
        v-for="e in emissions"
        :key="e.emissionId"
        class="flex-shrink-0 item-phone-margin"
        :emission="e"
        :class="[alignLeft ? 'me-3' : '', mainRubriquage(e)]"
        :nb-podcasts="nbPodcasts"
        :rubrique-name="rubriquesId(e)"
      />
    </transition-group>
    <router-link
      :to="href"
      class="btn btn-primary align-self-center width-fit-content m-4"
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
import { state } from '../../../stores/ParamSdkStore';
import { handle403 } from '../../mixins/handle403';
const PHONE_WIDTH = 960;
import ClassicLoading from '../../form/ClassicLoading.vue';
import { Emission } from '@/stores/class/general/emission';
import { Rubrique } from '@/stores/class/rubrique/rubrique';
import { defineComponent } from 'vue'
import { AxiosError } from 'axios';
import imageProxy from '../../mixins/imageProxy';
import { Rubriquage } from '@/stores/class/rubrique/rubriquage';
export default defineComponent({
  name: 'EmissionInlineList',

  components: {
    EmissionPlayerItem,
    ClassicLoading
  },

  mixins: [handle403,imageProxy],

  props: {
    organisationId: { default: undefined, type: String},
    href: { default: undefined, type: String},
    buttonText: { default: undefined, type: String},
    rubriqueId: { default: undefined, type: Number },
    rubriquageId: { default: undefined, type: Number },
    nbPodcasts: { default: undefined, type: Number },
    itemSize: { default: 13, type: Number },
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
    },
    isInlineAnimation(): boolean {
      return (state.generalParameters.isInlineAnimation as boolean);
    },
  },

  watch: {
    sizeItem(){
      this.handleResize();
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
      try {
        const data = await octopusApi.fetchDataWithParams<{count: number;result:Array<Emission>;sort: string;}>(0, 'emission/search',{
          first: this.first,
          size: this.size + 1,
          organisationId: this.organisationId,
          rubriqueId: this.rubriqueId ?  [this.rubriqueId] : [],
          rubriquageId: this.rubriquageId ? [this.rubriquageId] : [],
          sort: 'LAST_PODCAST_DESC',
        }, true);
        
        this.loading = false;
        this.loaded = true;
        this.totalCount = data.count;
        if (this.allEmissions.length + data.result.length < this.totalCount) {
          const nexEl = data.result.pop() as Emission;
          this.preloadImage(nexEl.imageUrl ? nexEl.imageUrl : "");
        }
        this.allEmissions = this.allEmissions.concat(data.result);
        if (this.allEmissions.length <= 3) {
          this.alignLeft = true;
        }
        this.first += this.size;
      } catch (error) {
        this.handle403((error as AxiosError));
      }
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
      if (this.overflowScroll) {
        this.size = 20;
        return;
      }
      if (window.innerWidth <= PHONE_WIDTH) {
        this.size = 10;
        return;
      }
      const width = (this.$el as HTMLElement).offsetWidth;
      const sixteen = domHelper.convertRemToPixels(this.itemSize + 0.7);
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
      img.src = this.proxyImageUrl(url,'330');
    },
    async fetchRubriques(): Promise<void> {
      const data = await octopusApi.fetchData<Rubriquage>(0, 'rubriquage/'+this.displayRubriquage);
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
      return state.emissionsPage.mainRubrique && emission.rubriqueIds?.includes(state.emissionsPage.mainRubrique) ? 'partenaireRubrique' : '';
    },
  },
})
</script>

<style lang="scss">
.octopus-app{
  .list-episode {
      padding: 2rem 0rem 1rem !important;
      @media (max-width: 450px) {
          padding: 0.5rem 0rem 1rem !important;
      }
      h2 {
          margin-bottom: 1rem;
      }
  }
}
</style>