<template>
  <div
    class="d-flex flex-column p-3"
  >
    <div 
      class="d-flex align-items-center"
      :class="podcastId?'mb-4':'mb-2'"
    >
      <h2 class="mb-0">
        {{ title }}
      </h2>
      <router-link
        v-if="isButtonNextTitle"
        class="btn admin-button m-1 fw-bold saooti-right"
        :title="buttonText"
        :to="refTo"
        @click="handleSeeMoreButton"
      />
    </div>
    <div
      v-if="!podcastId"
      class="d-flex justify-content-between"
    >
      <div class="d-flex">
        <button
          class="btn btn-underline"
          :class="{ active: !popularSort }"
          @click="sortChrono()"
        >
          {{ $t('Last added') }}
        </button>
        <button
          class="btn btn-underline"
          :class="{ active: popularSort }"
          @click="sortPopular()"
        >
          {{ $t('Most popular') }}
        </button>
      </div>
      <div
        v-if="displayArrow"
        class="hide-phone"
      >
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
    <slot name="list-inline" />
    <router-link
      v-if="!isButtonNextTitle && buttonText"
      class="btn btn-primary align-self-center width-fit-content m-4"
      :to="refTo"
      @click="handleSeeMoreButton"
    >
      {{ buttonText }}
      <div
        v-if="buttonPlus"
        class="ms-1 saooti-more"
      />
    </router-link>
  </div>
</template>

<script lang="ts">
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';
import { defineComponent } from 'vue'
import { RouteLocationRaw } from 'vue-router';
import { useFilterStore } from '@/stores/FilterStore';
import { mapState, mapActions } from 'pinia';
import { Rubrique } from '@/store/class/rubrique/rubrique';
export default defineComponent({
  name: 'PodcastInlineListTemplate',
  
  components: {
  },

  props: {
    displayArrow: { default: true, type: Boolean},
    previousAvailable: { default: false, type: Boolean},
    nextAvailable: { default: false, type: Boolean},
    popularSort: { default: false, type: Boolean},
    buttonText: { default: undefined, type: String},
    buttonPlus: { default:false, type: Boolean},
    title: { default: '', type: String},
    href: { default: undefined, type: String},
    iabId: { default: undefined, type: Number},
    rubriqueId: { default: () => [], type: Array as ()=> Array<number> },
    noRubriquageId: { default: () => [], type: Array as ()=> Array<number> },
    isButtonNextTitle: {default: false, type:Boolean},
    podcastId: { default: undefined, type: Number},
  },
  emits:['sortChrono','sortPopular', 'displayPrevious', 'displayNext'],
  data() {
    return {
    };
  },

  computed: {
    ...mapState(useFilterStore, ['filterOrgaId', 'filterRubrique', 'filterIab', 'filterRubriquage']),
    rubriqueQueryParam(): string|undefined{
      if(this.filterRubrique?.length){
        return this.filterRubrique.map((value: RubriquageFilter) =>  value.rubriquageId+':'+value.rubriqueId).join();
      }
      return undefined;
    },
    refTo(): string | RouteLocationRaw {
      if (this.href) return this.href;
      if(this.iabId){
        return {
          name: 'category',
          params:{ 'iabId': this.iabId },
          query: { productor: this.filterOrgaId },
        };
      }
      return {
          name: 'podcasts',
          query: { productor: this.filterOrgaId, 
                  iabId:this.filterIab?.id,
                  rubriquesId: this.rubriqueQueryParam },
        };
    },
  },

  methods: {
    ...mapActions(useFilterStore, ['filterUpdateRubrique']),
    sortChrono():void{
      this.$emit('sortChrono');
    },
    sortPopular():void{
      this.$emit('sortPopular');
    },
    displayPrevious():void{
      this.$emit('displayPrevious');
    },
    displayNext():void{
      this.$emit('displayNext');
    },
    handleSeeMoreButton(event: { preventDefault: () => void; }){
      if(!this.rubriqueId || 0===this.rubriqueId.length || this.noRubriquageId.length){
        return;
      }
      event.preventDefault();
      const rubriqueChosenId = this.rubriqueId[this.rubriqueId.length - 1];
      let filterToAdd: RubriquageFilter = {
        rubriquageId: 0, 
        rubriqueId: rubriqueChosenId, 
        nameRubriquage:  '',
        nameRubrique: ''
      };
      if(this.filterRubriquage.length){
        const rubriqueChosen =  this.filterRubriquage[this.rubriqueId.length - 1].rubriques.find((element: Rubrique) => element.rubriqueId === rubriqueChosenId);
        filterToAdd = {
          rubriquageId: this.filterRubriquage[this.rubriqueId.length - 1].rubriquageId, 
          rubriqueId: rubriqueChosenId, 
          nameRubriquage:  this.filterRubriquage[this.rubriqueId.length - 1].title,
          nameRubrique: rubriqueChosen.name
        };
      }
      const newFilter: Array<RubriquageFilter> = Array.from(this.filterRubrique);
      newFilter.push(filterToAdd);
      this.filterUpdateRubrique(newFilter);
      const queries = this.$route.query;
      const queryString = newFilter.map(value =>  value.rubriquageId+':'+value.rubriqueId).join();
      this.$router.push({ name: 'podcasts',query: { ...queries, ...{ rubriquesId: queryString }} });
    },
  },
})
</script>