<template>
  <div
    class="default-multiselect-width"
    :style="{ width: width }"
  >
    <label
      :for="id"
      class="d-inline"
      aria-label="select rubrique"
    />
    <Multiselect
      :id="id"
      ref="multiselectRef"
      v-model="model"
      :disabled="isDisabled"
      class="rubriqueChooser"
      label="name"
      track-by="rubriqueId"
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
      @open="clearAll"
      @search-change="onSearchRubrique"
      @close="onClose"
      @select="onRubriqueSelected"
    >
      <slot name="singleLabel">
        <div class="multiselect-octopus-proposition">
          <span class="option__title">
            {{ props.option.name }}
          </span>
        </div>
      </slot>
      <slot
        v-if="undefined!==props.option"
        name="option"
      >
        <div
          class="multiselect-octopus-proposition"
          :class="props.option.rubriqueId <= 0 ? 'primary-dark' : ''"
          :data-selenium="'rubric-chooser-' + seleniumFormat(props.option.name)"
        >
          <span class="option__title">{{ props.option.name }}</span>
        </div>
      </slot>
      <slot name="noOptions">
        {{ $t('List is empty') }}
      </slot>
      <slot name="noResult">
        {{ $t('No elements found. Consider changing the search query.') }}
      </slot>
      <slot
        class="saooti-arrow_down octopus-arrow-down octopus-arrow-down-top"
        name="caret"
      />
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

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    Multiselect,
  },
  mixins:[selenium],
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
  emits: ['update:rubriqueSelected', 'selected'],

  data() {
    return {
      rubriques: [] as Array<Rubrique>,
      rubrique: getDefaultRubrique(this.defaultanswer) as Rubrique|undefined,
      rubriqueForArray: [] as Array<Rubrique>,
      isLoading: false as boolean,
      withoutItem: { name: this.$t('Without rubric'), rubriqueId: -1 } as any,
    };
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
  watch: {
    model(): void {
      if(false===this.multiple){
        return;
      }
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
      if (this.withoutRubrique) {
        return [
          getDefaultRubrique(this.defaultanswer),
          this.withoutItem,
        ].concat(this.allRubriques);
      } else {
        return [(getDefaultRubrique(this.defaultanswer) as Rubrique)].concat(
          this.allRubriques
        );
      }
    },
    clearAll(): void {
      (this.$refs.multiselectRef as any).$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
      if (undefined === this.rubriqueArray) {
        this.rubrique = undefined;
      }
      this.rubriques = this.initRubriquesArray();
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
      this.rubriques = this.initRubriquesArray().filter((item: Rubrique) => {
        return item.name!.toUpperCase().includes(query!.toUpperCase());
      });
      this.isLoading = false;
    },
    onRubriqueSelected(rubrique: Rubrique|undefined): void {
      if (undefined !== this.rubriqueSelected) {
        this.$emit('update:rubriqueSelected', rubrique!.rubriqueId);
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
          this.rubriqueForArray!.push(item);
        }
      });
    },
  },
})
</script>
