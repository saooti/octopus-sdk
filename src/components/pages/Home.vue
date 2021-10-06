<template>
  <div class="page-box">
    <template v-if="0 === rubriquageFilter.length">
      <PodcastInlineList
        v-for="c in categories"
        :key="c.id"
        :iabId="c.id"
        :title="c.name"
        :buttonText="$t('All podcast button', { name: c.name })"
      />
    </template>
     <template v-else>
      <PodcastInlineList
        v-for="r in rubriqueDisplay"
        :key="r.rubriqueId"
        :rubriqueId="rubriqueId.concat(r.rubriqueId)"
        :title="r.name"
        :buttonText="$t('All podcast button', { name: r.name })"
      />
      <PodcastInlineList
        v-if="rubriqueDisplay && rubriqueDisplay.length"
        :noRubriquageId="[rubriqueDisplay[0].rubriquageId]"
        :rubriqueId="rubriqueId"
        :title="$t('Without rubric')"
        :buttonText="$t('All podcast button', { name: $t('Without rubric') })"
      />
    </template>
  </div>
</template>
<style lang="scss"></style>

<script lang="ts">
import PodcastInlineList from '../display/podcasts/PodcastInlineList.vue';
import { state } from '../../store/paramStore';

import Vue from 'vue';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
import { Rubriquage } from '@/store/class/rubriquage';
import { Rubrique } from '@/store/class/rubrique';
export default Vue.extend({
  name: 'home',

  components: {
    PodcastInlineList,
  },
  data() {
    return {
      rubriqueId: [] as Array<number>,
    };
  },
  created(){
    if(this.rubriqueFilter.length){
      this.updateRubriquageFilter();
    }
  },
  computed: {
    rubriqueDisplay(): Array<Rubrique>{
      return this.$store.state.filter.rubriqueDisplay.filter((rubrique: Rubrique) => 0 !== rubrique.podcastCount );
    },
    rubriquageFilter(): Array<Rubriquage>{
      if(this.$store.state.filter.organisationId){
        return this.$store.state.filter.rubriquageArray;
      }
      return [];
    },
    rubriqueFilter(): Array<RubriquageFilter>{
      return this.$store.state.filter.rubriqueFilter;
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    categories(): any {
      if(this.$store.state.filter.iab){
        return [this.$store.state.filter.iab];
      }
      return this.$store.state.categories.filter((c: any) => {
        if (this.isPodcastmaker) return c.podcastOrganisationCount;
        return c.podcastCount;
      });
    },
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
  },
  watch:{
    rubriqueFilter(){
      this.updateRubriquageFilter();
    }
  }
});
</script>
