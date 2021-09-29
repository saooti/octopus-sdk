<template>
  <div class="d-flex align-items-center">
    <label class="wrap">
      <select
        v-model="rubriquageId"
        class="basic-select ml-2 mb-0 border c-hand"
        @change="onRubriquageSelected"
      >
        <option
          v-for="rubriquage in rubriquageDisplay"
          :key="rubriquage.rubriquageId"
          :value="rubriquage.rubriquageId"
        >{{ rubriquage.title }}</option>
      </select>
      <div
        class="saooti-arrow_down octopus-arrow-down-2 classic-select"
      />
    </label>
    <template v-if="rubriquageId">
      <div class="ml-3 flex-shrink">
        {{ $t('By rubric') }}
      </div>
      <RubriqueChooser
        v-if="getRubriques(rubriquageId).length"
        class="ml-2"
        :multiple="false"
        :rubriquage-id="rubriquageId"
        :rubrique-selected="0 < rubriqueIdSelected? rubriqueIdSelected : undefined"
        :all-rubriques="getRubriques(rubriquageId)"
        :defaultanswer="$t('No rubric filter')"
        :reset="reset"
        :without-rubrique="true"
        width="auto"
        @selected="onRubriqueSelected"
      />
    </template>
    <button
      v-if="index"
      class="btn btn-circle primary-color ml-1"
      aria-label="delete"
      @click="deleteRubriquage"
    >
      <span class="saooti-bin" />
    </button>
  </div>
</template>
<style lang="scss">
</style>
<script lang="ts">
// @ is an alias to /src
import { Rubriquage } from '@/store/class/rubriquage';
import { Rubrique } from '@/store/class/rubrique';
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    RubriqueChooser: () => import('../rubriques/RubriqueChooser.vue'),
  },
  props: {
    rubriquageDisplay: { default: () => ([]) as Array<Rubriquage>},
    rubriquageIdSelected:{default: 0 as number},
    rubriqueIdSelected: { default: 0 as number},
    index: { default: 0 as number},
  },
  emits: ['deleteRubriqueChoice', 'updateRubrique', 'updateRubriquage'],

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
})
</script>
