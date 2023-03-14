<template>
  <div class="page-box">
    <template v-if="0 === rubriquageFilter.length">
      <PodcastInlineList
        v-for="c in categories"
        :key="c.id"
        :iab-id="c.id"
        :title="c.name"
        :button-text="$t('All podcast button', { name: c.name })"
      />
    </template>
    <template v-else>
      <PodcastInlineList
        v-for="r in rubriqueToShow"
        :key="r.rubriqueId"
        :rubrique-id="rubriqueId.concat(r.rubriqueId)"
        :title="r.name"
        :button-text="$t('All podcast button', { name: r.name })"
      />
      <PodcastInlineList
        v-if="!tooManyRubrique"
        :no-rubriquage-id="[rubriqueDisplay[0].rubriquageId]"
        :rubrique-id="rubriqueId"
        :title="$t('Without rubric')"
        :button-text="$t('All podcast button', { name: $t('Without rubric') })"
      />
      <router-link
        v-else
        :to="{
          name: 'podcasts',
          query: { productor: filterOrgaId, 
                  iabId: filterIab?.id,
                  rubriquesId: this.rubriqueQueryParam },
          }"
        class="btn btn-primary align-self-center width-fit-content mt-5 m-auto"
      >
        {{
          $t('See more')
        }}
      </router-link>
    </template>
  </div>
</template>

<script lang="ts">
import PodcastInlineList from '../display/podcasts/PodcastInlineList.vue';
import { state } from '../../stores/ParamSdkStore';
import { RubriquageFilter } from '@/stores/class/rubrique/rubriquageFilter';
import { Rubriquage } from '@/stores/class/rubrique/rubriquage';
import { Rubrique } from '@/stores/class/rubrique/rubrique';
import { useFilterStore } from '@/stores/FilterStore';
import { useGeneralStore } from '@/stores/GeneralStore';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
import { Category } from '@/stores/class/general/category';
export default defineComponent({
  name: 'Home',
  components: {
    PodcastInlineList,
  },
  data() {
    return {
      rubriqueId: [] as Array<number>,
      rubriqueMaxDisplay: 20 as number,
    };
  },
  computed: {
    ...mapState(useGeneralStore, ['storedCategories']),
    ...mapState(useFilterStore, ['filterRubriquage', 'filterOrgaId', 'filterRubrique', 'filterRubriqueDisplay', 'filterIab']),
    rubriqueQueryParam(): string|undefined{
      if(this.filterRubrique?.length){
        return this.filterRubrique.map((value: RubriquageFilter) =>  value.rubriquageId+':'+value.rubriqueId).join();
      }
      return undefined;
    },
    tooManyRubrique(): boolean{
      return this.rubriqueDisplay && this.rubriqueDisplay.length >this.rubriqueMaxDisplay;
    },
    rubriqueDisplay(): Array<Rubrique>{
      return this.filterRubriqueDisplay.filter((rubrique: Rubrique) => 0 !== rubrique.podcastCount );
    },
    rubriqueToShow(): Array<Rubrique>{
      if(!this.tooManyRubrique){
        return this.rubriqueDisplay ?? [];
      }
      return this.rubriqueDisplay.slice(0, this.rubriqueMaxDisplay);
    },
    rubriquageFilter(): Array<Rubriquage>{
      return this.filterOrgaId? this.filterRubriquage :[];
    },
    rubriqueFilter(): Array<RubriquageFilter>{
      return this.filterRubrique;
    },
    categories(): Array<Category> {
      if(this.filterIab){
        return [this.filterIab];
      }
      return this.storedCategories.filter((c: Category) => {
        if (state.generalParameters.podcastmaker) return c.podcastOrganisationCount;
        return c.podcastCount;
      });
    },
  },
  watch:{
    rubriqueFilter:{
      deep: true,
      immediate: true,
      handler(){
        this.updateRubriquageFilter();
      }
    }
  },
  methods:{
    updateRubriquageFilter(){
      const length = this.rubriqueFilter.length;
      const rubriqueId: Array<number>= [];
      for (let index = 0; index < length; index++) {
        if(0 < this.rubriqueFilter[index].rubriqueId){
          rubriqueId.push(this.rubriqueFilter[index].rubriqueId);
        }
      }
      this.rubriqueId = rubriqueId;
    },
  }
})
</script>