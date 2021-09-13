<template>
  <div class="d-flex align-items-center">
    <label class="wrap">
      <select
        class="basic-select ml-2 mb-0 border c-hand"
        v-model="rubriquageId"
        @change="onRubriquageSelected"
      >
        <option
          v-for="rubriquage in rubriquageDisplay"
          :key="rubriquage.rubriquageId"
          :value="rubriquage.rubriquageId"
          >{{ rubriquage.title }}</option
        >
      </select>
      <div
        class="saooti-arrow_down octopus-arrow-down-2 classic-select"
      ></div>
    </label>
    <template v-if="rubriquageId">
      <div class="ml-3 flex-shrink">{{ $t('By rubric') }}</div>
      <RubriqueChooser
        class="ml-2"
        :multiple="false"
        :rubriquageId="rubriquageId"
        :rubriqueSelected="0 < this.rubriqueIdSelected? this.rubriqueIdSelected : undefined"
        :allRubriques="getRubriques(rubriquageId)"
        :defaultanswer="$t('No rubric filter')"
        :reset="reset"
        :withoutRubrique="true"
        width="auto"
        v-if="getRubriques(rubriquageId).length"
        @selected="onRubriqueSelected"
      />
    </template>
    <button
      class="btn btn-circle primary-color ml-1"
      aria-label="delete"
      @click="deleteRubriquage"
      v-if="index"
    >
      <span class="saooti-bin"></span>
    </button>
  </div>
</template>
<style lang="scss">
</style>
<script lang="ts">
// @ is an alias to /src
import Vue from 'vue';
import { Rubriquage } from '@/store/class/rubriquage';
import { Rubrique } from '@/store/class/rubrique';
export default Vue.extend({
  components: {
    RubriqueChooser: () => import('../rubriques/RubriqueChooser.vue'),
  },
  props: {
    rubriquageDisplay: { default: () => ([]) as Array<Rubriquage>},
    rubriquageIdSelected:{default: 0 as number},
    rubriqueIdSelected: { default: 0 as number},
    index: { default: 0 as number},
  },

  data() {
    return {
      rubriquageId: undefined as number|undefined,
      rubriqueId: undefined as number|undefined,
      reset: false as boolean,
    };
  },

  created(){
    this.rubriquageId = this.rubriquageIdSelected;
  },

  methods: {
    deleteRubriquage(){
      this.$emit('deleteRubriqueChoice');
    },
    getRubriques(rubriquageId: number): Array<Rubrique> {
      const topicIndex = this.rubriquageDisplay.findIndex(
        ( element: Rubriquage) => element.rubriquageId === rubriquageId
      );
      if(-1 !== topicIndex){
        return this.rubriquageDisplay[topicIndex].rubriques;
      }
      return [];
    },
    onRubriqueSelected(rubrique: Rubrique): void {
      if (rubrique.rubriqueId === this.rubriqueId) return;
      this.rubriqueId = rubrique.rubriqueId;
      this.$emit('updateRubrique', {rubriqueId : rubrique.rubriqueId, index: this.index});
    },
    onRubriquageSelected(): void {
      this.reset = !this.reset;
      this.rubriqueId = 0;
      this.$emit('updateRubriquage', {rubriquageId : this.rubriquageId, index: this.index});
    },
  },
});
</script>
