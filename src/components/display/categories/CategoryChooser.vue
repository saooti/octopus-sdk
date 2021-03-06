<template>
  <div class="w-100" :style="{ width: width }">
    <label :for="id" class="d-inline" aria-label="select category"></label>
    <Multiselect
      v-model="model"
      :disabled="isDisabled"
      :id="id"
      label="name"
      track-by="id"
      :placeholder="$t('Type string to filter by categories')"
      ref="multiselectRef"
      :options="categories"
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
      @search-change="onSearchCategory"
      @close="onClose"
      @select="onCategorySelected"
    >
      <template slot="singleLabel" slot-scope="props">
        <div class="multiselect-octopus-proposition">
          <span class="option__title">
            {{ props.option.name }}
          </span>
        </div>
      </template>
      <template slot="option" slot-scope="props">
        <div class="multiselect-octopus-proposition">
          <span class="option__title">{{ props.option.name }}</span>
        </div>
      </template>
      <template slot="noOptions">{{ $t('List is empty') }}</template>
      <span slot="noResult">
        {{ $t('No elements found. Consider changing the search query.') }}
      </span>
      <div class="position-relative" slot="caret">
        <span
          class="saooti-arrow_down octopus-arrow-down-2 octopus-arrow-down-top"
        ></span>
      </div>
    </Multiselect>
  </div>
</template>

<style lang="scss"></style>
<script lang="ts">
import Multiselect from 'vue-multiselect';

const getDefaultCategory = (defaultName: string) => {
  if ('' === defaultName){
    return undefined;
  }
  return { name: defaultName, id: 0 };
};

import Vue from 'vue';
import { Category } from '@/store/class/category';
export default Vue.extend({
  components: {
    Multiselect,
  },
  props: {
    width: { default: '100%' as string },
    defaultanswer: { default: '' as string },
    categorySelected: { default: undefined as number|undefined },
    multiple: { default: false as boolean },
    categoryArray: { default: undefined as Array<number>|undefined },
    displayAllCategories: { default: false as boolean },
    isDisabled: { default: false as boolean },
  },
   data() {
    return {
      categories: [] as Array<Category>,
      category: getDefaultCategory(this.defaultanswer) as Category|undefined,
      categoryForArray: [getDefaultCategory(this.defaultanswer)] as Array<Category>|undefined,
      isLoading: false as boolean,
      totalCategories: [] as Array<Category>,
      init: true as boolean,
      initArray: false as boolean,
    };
  },


  computed: {
    allCategories(): Array<Category> {
      return [...this.$store.state.categories].sort((a: Category, b: Category) =>
        a.name > b.name ? 1 : -1
      );
    },
    id(): string {
      if (this.multiple) return 'categoryChooser' + this.multiple;
      return 'categoryChooser';
    },
    model: {
      get(): Category| Array<Category>|undefined{
        if(false===this.initArray){
          return this.category;
        }
        return this.categoryForArray;
      },
      set(value: any): void{
        if(false===this.initArray){
          this.category = value;
          return
        }
        this.categoryForArray = value;
      }

    }
  },
 
  mounted() {
    if (undefined !== this.categorySelected) {
      this.initCategorySelected(this.categorySelected);
    }
    if (undefined !== this.categoryArray) {
      this.initCategoryArray(this.categoryArray);
      this.initArray=true;
    }
  },
  methods: {
    clearAll(): void {
      (this.$refs.multiselectRef as any).$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
      if (undefined === this.categoryArray) {
        this.category = undefined;
      }
      if (
        undefined !== this.categorySelected ||
        undefined !== this.categoryArray ||
        this.displayAllCategories
      ) {
        this.totalCategories = this.allCategories;
      } else {
        this.totalCategories = this.allCategories.filter((c: Category) => {
          return c.podcastCount;
        });
      }
      if ('' !== this.defaultanswer) {
        this.categories = [getDefaultCategory(this.defaultanswer)!].concat(
          this.totalCategories
        );
      } else {
        this.categories = this.totalCategories;
      }
    },
    onClose(): void {
      if (!this.category && undefined === this.categoryArray) {
        this.category = getDefaultCategory(this.defaultanswer);
        this.onCategorySelected(this.category!);
      }
    },
    onSearchCategory(query: string): void {
      this.isLoading = true;
      let list: Array<Category> = [getDefaultCategory(this.defaultanswer)!].concat(
        this.totalCategories
      );
      if ('' === this.defaultanswer) {
        list = this.totalCategories;
      }
      this.categories = list.filter((item: Category) => {
        return item.name.toUpperCase().includes(query.toUpperCase());
      });
      this.isLoading = false;
    },
    onCategorySelected(category: Category): void {
      if (undefined !== this.categorySelected) {
        this.$emit('update:categorySelected', category.id);
      } else if (undefined === this.categoryArray) {
        this.$emit('selected', category);
      }
    },
    initCategorySelected(val: number): void {
      this.category = this.$store.state.categories.find((el: Category) => {
        return el.id === val;
      });
    },
    initCategoryArray(val: Array<number>): void {
      this.categoryForArray!.length = 0;
      val.forEach((element: number) => {
        const item = this.$store.state.categories.find((el: Category) => {
          return el.id === element;
        });
        this.categoryForArray!.push(item);
      });
    },
  },
  watch: {
    categorySelected(): void {
      this.initCategorySelected(this.categorySelected);
    },
    model(): void {
      if(undefined===this.categoryArray){
        return;
      }
      const idsArray: Array<number> = [];
      this.categoryForArray!.forEach((el: Category) => {
        idsArray.push(el.id);
      });
      this.$emit('selected', idsArray);
    },
  },
});
</script>
