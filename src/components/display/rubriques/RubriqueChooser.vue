<template>
  <div
    class="default-multiselect-width"
    :style="{ width: width }"
  >
    <label
      :for="id"
      class="d-inline"
      title="select rubrique"
    />
    <VueMultiselect
      :id="id"
      ref="multiselectRef"
      v-model="model"
      :disabled="isDisabled"
      class="rubriqueChooser"
      label="name"
      track-by="rubriqueId"
      :aria-expanded="false"
      :placeholder="$t('Type string to filter by rubrics')"
      :options="rubriques"
      :multiple="multiple"
      :searchable="true"
      :loading="isLoading"
      :internal-search="false"
      :clear-on-select="false"
      :close-on-select="true"
      :options-limit="200"
      :max-height="600"
      :show-no-results="true"
      :hide-selected="true"
      :show-labels="false"
      @open="onOpen"
      @search-change="onSearchRubrique"
      @select="onRubriqueSelected"
    >
      <template #singleLabel="{ option }">
        <div class="multiselect-octopus-proposition">
          <span class="option__title">
            {{ option.name }}
          </span>
        </div>
      </template>
      <template
        #option="{ option }"
      >
        <div
          v-if="undefined!==option"
          class="multiselect-octopus-proposition"
          :class="option.rubriqueId <= 0 ? 'text-primary' : ''"
          :data-selenium="'rubric-chooser-' + seleniumFormat(option.name)"
        >
          <span class="option__title">{{ option.name }}</span>
        </div>
      </template>
      <template #noOptions>
        {{ $t('List is empty') }}
      </template>
      <template #noResult>
        {{ $t('No elements found. Consider changing the search query.') }}
      </template>
      <template #caret>
        <span class="saooti-down octopus-arrow-down octopus-arrow-down-absolute" />
      </template>
    </VueMultiselect>
  </div>
</template>

<script lang="ts">
import selenium from '../../mixins/selenium';
//@ts-ignore
import VueMultiselect from 'vue-multiselect';
import { Rubrique } from '@/store/class/rubrique/rubrique';
const getDefaultRubrique = (defaultName: string) => {
  if ('' === defaultName){
    return undefined;
  }
  return { name: defaultName, rubriqueId: 0 } as Rubrique;
};

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    VueMultiselect,
  },
  mixins:[selenium],
  props: {
    width: { default: '100%', type: String },
    defaultanswer: { default: '', type: String },
    rubriqueSelected: { default: undefined, type: Number },
    multiple: { default: false, type: Boolean },
    rubriqueArray: { default: undefined, type: Object as ()=>Array<number> },
    rubriquageId: { default: undefined, type: Number },
    allRubriques: { default: () => [], type: Array as ()=> Array<Rubrique> },
    reset: { default: false, type: Boolean },
    withoutRubrique: { default: false, type: Boolean },
    isDisabled: { default: false, type: Boolean },
    cannotBeUndefined: {default: false, type: Boolean}
  },
  emits: ['update:rubriqueSelected', 'selected'],

  data() {
    return {
      rubriques: [] as Array<Rubrique>,
      rubrique: getDefaultRubrique(this.defaultanswer),
      rubriqueForArray: [] as Array<Rubrique>,
      isLoading: false as boolean,
      withoutItem: { name: this.$t('Without rubric'), rubriqueId: -1 } as {name: string, rubriqueId:number},
    };
  },
  computed: {
    id(): string {
      return this.rubriquageId? 'rubriqueChooser' + this.rubriquageId : 'rubriqueChooser';
    },
    model: {
      get(): Rubrique| Array<Rubrique>|undefined{
        return false===this.multiple ? this.rubrique:this.rubriqueForArray;
      },
      set(value: Rubrique| Array<Rubrique>|undefined): void{
        if(false===this.multiple){
          this.rubrique = (value as Rubrique|undefined);
          return
        }
        this.rubriqueForArray = (value as Array<Rubrique>);
      }

    }
  },
  watch: {
    model:{
      deep: true,
      handler(){
        if(false===this.multiple){
          return;
        }
        const selected: Array<Rubrique> = JSON.parse(JSON.stringify(this.model));
        const idsArray: Array<number> = [];
        selected.forEach((el: Rubrique) => {
          if(el.rubriqueId){
            idsArray.push(el.rubriqueId);
          }
        });
        this.$emit('selected', idsArray);
      }
    },
    rubriqueSelected: {
      deep: true,
      handler(){
        if (undefined !== this.rubriqueSelected) {
          this.initRubriqueSelected(this.rubriqueSelected);
        }
      }
    },
    reset(): void {
      this.rubrique = getDefaultRubrique(this.defaultanswer);
    }
  },
  mounted() {
    if (undefined !== this.rubriqueSelected) {
      this.initRubriqueSelected(this.rubriqueSelected);
    }
    if (undefined !== this.rubriqueArray) {
      this.initRubriqueArray(this.rubriqueArray);
    }
  },
  methods: {
    initRubriquesArray(): Array<Rubrique>{
      if ('' === this.defaultanswer) {
        return this.allRubriques;
      }
      const rubriqueDefault = getDefaultRubrique(this.defaultanswer);
      if(!rubriqueDefault){
        return this.allRubriques;
      }
      if (this.withoutRubrique) {
        return [
          rubriqueDefault,
          this.withoutItem,
        ].concat(this.allRubriques);
      }
      return [rubriqueDefault].concat(this.allRubriques);
    },
    onOpen(): void {
      (this.$refs.multiselectRef as VueMultiselect).$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
      this.rubriques = this.initRubriquesArray();
    },
    onClose(): void {
      if (this.rubrique || undefined !== this.rubriqueArray) return;
      if(this.cannotBeUndefined && undefined !== this.rubriqueSelected){
        this.initRubriqueSelected(this.rubriqueSelected);
        return;
      }
      this.rubrique ='' !== this.defaultanswer? getDefaultRubrique(this.defaultanswer): undefined;
      this.onRubriqueSelected(this.rubrique);
    },
    onSearchRubrique(query: string): void {
      this.isLoading = true;
      this.rubriques = this.initRubriquesArray().filter((item: Rubrique) => {
        return item.name.toUpperCase().includes(query.toUpperCase());
      });
      this.isLoading = false;
    },
    onRubriqueSelected(rubrique: Rubrique|undefined): void {
      if (undefined !== this.rubriqueSelected && rubrique) {
        this.$emit('update:rubriqueSelected', rubrique.rubriqueId);
      }
      if (false === this.multiple) {
        this.$emit('selected', rubrique);
      }
    },
    initRubriqueSelected(val: number): void {
      this.rubrique = this.initRubriquesArray().find((el: Rubrique) => {
        return el.rubriqueId === val;
      });
    },
    initRubriqueArray(val: number[]): void {
      this.rubriqueForArray = [];
      val.forEach((element: number) => {
        const item = this.initRubriquesArray().find((el: Rubrique) => {
          return el.rubriqueId === element;
        });
        if(undefined!==item){
          this.rubriqueForArray.push(item);
        }
      });
    },
  },
})
</script>