<template>
  <div class="default-multiselect-width" :style="{ width: width }">
    <label :for="id" class="d-inline" aria-label="select rubrique"></label>
    <Multiselect
      v-model="model"
      :id="id"
      :disabled="isDisabled"
      class="rubriqueChooser"
      label="name"
      track-by="rubriqueId"
      :placeholder="$t('Type string to filter by rubrics')"
      ref="multiselectRef"
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
      @open="clearAll"
      @search-change="onSearchRubrique"
      @close="onClose"
      @select="onRubriqueSelected"
    >
      <template slot="singleLabel" slot-scope="props">
        <div class="multiselect-octopus-proposition">
          <span class="option__title">
            {{ props.option.name }}
          </span>
        </div>
      </template>
      <template slot="option" slot-scope="props" v-if="undefined!==props.option">
        <div
          class="multiselect-octopus-proposition"
          :class="props.option.rubriqueId <= 0 ? 'primary-dark' : ''"
          :data-selenium="'rubric-chooser-' + seleniumFormat(props.option.name)"
        >
          <span class="option__title">{{ props.option.name }}</span>
        </div>
      </template>
      <template slot="noOptions">{{ $t('List is empty') }}</template>
      <span slot="noResult">
        {{ $t('No elements found. Consider changing the search query.') }}
      </span>
      <span
        class="saooti-arrow_down octopus-arrow-down octopus-arrow-down-top"
        slot="caret"
      ></span>
    </Multiselect>
  </div>
</template>

<style lang="scss"></style>
<script lang="ts">
import { selenium } from '../../mixins/functions';
import Multiselect from 'vue-multiselect';
import { Rubrique } from '@/store/class/rubrique';
const getDefaultRubrique = (defaultName: string) => {
  if ('' === defaultName){
    return undefined;
  }
  return { name: defaultName, rubriqueId: 0 };
};

export default selenium.extend({
  components: {
    Multiselect,
  },
  props: {
    width: { default: '100%' as string },
    defaultanswer: { default: '' as string },
    rubriqueSelected: { default: undefined as number|undefined },
    multiple: { default: false as boolean },
    rubriqueArray: { default: undefined as Array<number>|undefined },
    rubriquageId: { default: undefined as number|undefined },
    allRubriques: { default: () => ([])  as Array<Rubrique>|undefined },
    reset: { default: false as boolean },
    withoutRubrique: { default: false as boolean },
    isDisabled: { default: false as boolean },
  },

  data() {
    return {
      rubriques: [] as Array<Rubrique>,
      rubrique: getDefaultRubrique(this.defaultanswer) as Rubrique|undefined,
      rubriqueForArray: [] as Array<Rubrique>,
      isLoading: false as boolean,
      withoutItem: { name: this.$t('Without rubric'), rubriqueId: -1 } as any,
    };
  },
  mounted() {
    if (undefined !== this.rubriqueSelected) {
      this.initRubriqueSelected(this.rubriqueSelected);
    }
    if (undefined !== this.rubriqueArray) {
      this.initRubriqueArray(this.rubriqueArray);
    }
  },
  computed: {
    id(): string {
      if (this.rubriquageId) return 'rubriqueChooser' + this.rubriquageId;
      return 'rubriqueChooser';
    },
    model: {
      get(): Rubrique| Array<Rubrique>|undefined{
        if(false===this.multiple){
          return this.rubrique;
        }
        return this.rubriqueForArray;
      },
      set(value: any): void{
        if(false===this.multiple){
          this.rubrique = value;
          return
        }
        this.rubriqueForArray = value;
      }

    }
  },
  methods: {
    clearAll(): void {
      (this.$refs.multiselectRef as any).$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
      if (undefined === this.rubriqueArray) {
        this.rubrique = undefined;
        /* this.rubriqueForArray.length = 0; */
      }
      if ('' === this.defaultanswer) {
        this.rubriques = this.allRubriques;
        return;
      }
      if (this.withoutRubrique) {
        this.rubriques = [
          getDefaultRubrique(this.defaultanswer),
          this.withoutItem,
        ].concat(this.allRubriques);
      } else {
        this.rubriques = [(getDefaultRubrique(this.defaultanswer) as Rubrique)].concat(
          this.allRubriques
        );
      }
    },
    onClose(): void {
      if (this.rubrique || undefined !== this.rubriqueArray) return;
      if ('' !== this.defaultanswer) {
        this.rubrique = getDefaultRubrique(this.defaultanswer);
      } else {
        this.rubrique = undefined;
      }
      this.onRubriqueSelected(this.rubrique);
    },
    onSearchRubrique(query?: string): void {
      this.isLoading = true;
      let list;
      if (undefined !== this.defaultanswer) {
        if (this.withoutRubrique) {
          list = [
            (getDefaultRubrique(this.defaultanswer) as Rubrique),
            this.withoutItem,
          ].concat(this.allRubriques);
        } else {
          list = [(getDefaultRubrique(this.defaultanswer)! as Rubrique)].concat(
            this.allRubriques
          );
        }
      } else {
        list = this.allRubriques;
      }
      this.rubriques = list.filter((item: Rubrique) => {
        return item.name!.toUpperCase().includes(query!.toUpperCase());
      });
      this.isLoading = false;
    },
    onRubriqueSelected(rubrique: Rubrique|undefined): void {
      if (undefined !== this.rubriqueSelected) {
        this.$emit('update:rubrique', rubrique!.rubriqueId);
      } else if (false === this.multiple) {
        this.$emit('selected', rubrique);
      }
    },
    initRubriqueSelected(val: number): void {
      this.rubrique = this.allRubriques.find((el: Rubrique) => {
        return el.rubriqueId === val;
      });
    },
    initRubriqueArray(val: number[]): void {
      this.rubriqueForArray = [];
      val.forEach((element: number) => {
        const item = this.allRubriques.find((el: Rubrique) => {
          return el.rubriqueId === element;
        });
        if(undefined!==item){
          this.rubriqueForArray!.push(item);
        }
      });
    },
  },
  watch: {
    model(): void {
      if(false===this.multiple){
        return;
      }
      /* console.log(this.model); */
      const selected: Array<Rubrique> = JSON.parse(JSON.stringify(this.model));
      const idsArray: Array<number> = [];
      selected.forEach((el: Rubrique) => {
        idsArray.push(el.rubriqueId!);
      });
      this.$emit('selected', idsArray);
    },
    rubriqueSelected(): void {
      this.initRubriqueSelected(this.rubriqueSelected);
    },
    reset(): void {
      this.rubrique = getDefaultRubrique(this.defaultanswer);
    }
  },
});
</script>
