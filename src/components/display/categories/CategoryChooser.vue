<template>
  <div
    class="default-multiselect-width"
    :style="{ width: width }"
  >
    <label
      :for="id"
      class="hid"
    >{{ $t('Type string to filter by categories') }}</label>
    <VueMultiselect
      :id="id"
      ref="multiselectRef"
      v-model="model"
      :disabled="isDisabled"
      label="name"
      track-by="id"
      :aria-expanded="false"
      :placeholder="$t('Type string to filter by categories')"
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
      @open="onOpen"
      @search-change="onSearchCategory"
      @select="onCategorySelected"
    >
      <template #singleLabel="{ option }">
        <div class="multiselect-octopus-proposition">
          <span class="option__title">
            {{ option.name }}
          </span>
        </div>
      </template>
      <template #option="{ option }">
        <div class="multiselect-octopus-proposition">
          <span class="option__title">{{ option.name }}</span>
        </div>
      </template>
      <template #noOptions="">
        {{ $t('List is empty') }}
      </template>
      <template #noResult="">
        <span>
          {{ $t('No elements found. Consider changing the search query.') }}
        </span>
      </template>
      <template #caret="">
        <div class="position-relative">
          <span
            class="saooti-down octopus-arrow-down octopus-arrow-down-absolute"
          />
        </div>
      </template>
    </VueMultiselect>
  </div>
</template>

<script lang="ts">
//@ts-ignore
import VueMultiselect from 'vue-multiselect';

const getDefaultCategory = (defaultName: string) => {
  if ('' === defaultName){
    return undefined;
  }
  return { name: defaultName, id: 0 };
};

import { Category } from '@/store/class/general/category';
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    VueMultiselect
  },
  props: {
    width: { default: '100%', type: String },
    defaultanswer: { default: '', type: String },
    categorySelected: { default: undefined, type: Number },
    multiple: { default: false, type: Boolean },
    categoryArray: { default: undefined, type: Array as ()=>Array<number> },
    displayAllCategories: { default: false, type: Boolean },
    isDisabled: { default: false, type: Boolean },
    initCategories: { default: undefined, type: Array as ()=>Array<Category> },
  },
  emits: ['update:categorySelected','selected'],
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
    categoriesChosen(): Array<Category>{
      if(this.initCategories){
        return this.initCategories;
      }
      return this.$store.state.categories;
    },
    allCategories(): Array<Category> {
      return [...this.categoriesChosen].sort((a: Category, b: Category) =>
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
      set(value: Category| Array<Category>|undefined): void{
        if(false===this.initArray){
          this.category = (value as Category|undefined);
          return
        }
        this.categoryForArray = (value as Array<Category>|undefined);
      }

    }
  },
  watch: {
    categorySelected(): void {
      if(this.categorySelected){
        this.initCategorySelected(this.categorySelected);
      }
    },
    model: {
      deep: true,
      handler(){
        if(undefined===this.categoryArray ||undefined === this.categoryForArray){
          return;
        }
        const idsArray: Array<number> = [];
        this.categoryForArray.forEach((el: Category) => {
          idsArray.push(el.id);
        });
        this.$emit('selected', idsArray);
      }
    },
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
    onOpen(): void {
      (this.$refs.multiselectRef as VueMultiselect).$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
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
        const categoryDefault = getDefaultCategory(this.defaultanswer);
        if(categoryDefault){
          this.categories = [categoryDefault].concat(
            this.totalCategories
          );
        }
      } else {
        this.categories = this.totalCategories;
      }
    },
    onSearchCategory(query: string): void {
      this.isLoading = true;
      const categoryDefault = getDefaultCategory(this.defaultanswer);
      if(categoryDefault){
        let list: Array<Category> = [categoryDefault].concat(
          this.totalCategories
        );
        if ('' === this.defaultanswer) {
          list = this.totalCategories;
        }
        this.categories = list.filter((item: Category) => {
          return item.name.toUpperCase().includes(query.toUpperCase());
        });
      }
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
      let categorySelected = this.categoriesChosen.find((el: Category) => {
        return el.id === val;
      });
      if(!categorySelected){
        categorySelected = getDefaultCategory(this.defaultanswer);
      }
      this.category = categorySelected;
    },
    initCategoryArray(val: Array<number>): void {
      if(!this.categoryForArray){
        return;
      }
      this.categoryForArray.length = 0;
      val.forEach((element: number) => {
        const item = this.categoriesChosen.find((el: Category) => {
          return el.id === element;
        });
        if(this.categoryForArray && item){
          this.categoryForArray.push(item);
        }
      });
    },
  },
})
</script>