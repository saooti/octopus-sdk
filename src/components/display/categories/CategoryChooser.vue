<template>
  <div class="w-100" :style="{ width: width }">
    <label :for="id" class="d-inline" aria-label="select category"></label>
    <Multiselect
      v-model="category"
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
      @select="onEmissionSelected"
    >
      <template v-slot:singleLabel="props" >
        <div class="multiselect-octopus-proposition">
          <span class="option__title">
            {{ props.option.name }}
          </span>
        </div>
      </template>
      <template v-slot:option="props" >
        <div class="multiselect-octopus-proposition">
          <span class="option__title">{{ props.option.name }}</span>
        </div>
      </template>
      <template v-slot:noOptions>{{ $t('List is empty') }}</template>
      <template v-slot:noResult>
      <span>
        {{ $t('No elements found. Consider changing the search query.') }}
      </span>
      </template>
      <template v-slot:caret>
      <div class="position-relative">
        <span
          class="saooti-arrow_down octopus-arrow-down-2 octopus-arrow-down-top"
        ></span>
      </div>
      </template>
    </Multiselect>
  </div>
</template>

<style lang="scss"></style>
<script lang="ts">
import Multiselect from 'vue-multiselect';
import { state } from '../../../store/paramStore';

const getDefaultCategory = (defaultName: any) => {
  if (undefined !== defaultName) return { name: defaultName, id: 0 };
  return '';
};

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    Multiselect,
  },

  props: {
    width: { default: '100%' },
    defaultanswer: { default: undefined as any },
    categorySelected: { default: undefined as any },
    multiple: { default: false },
    categoryArray: { default: undefined as any },
    displayAllCategories: { default: false },
    isDisabled: { default: false },
  },

  computed: {
    allCategories() {
      return state.generalParameters.allCategories.sort((a:any, b:any) =>
        a.name > b.name ? 1 : -1
      );
    },
    id():string {
      if (this.multiple) return 'categoryChooser' + this.multiple;
      return 'categoryChooser';
    },
  },

  data() {
    return {
      categories: [] as any,
      category: getDefaultCategory(this.defaultanswer) as any,
      isLoading: false,
      totalCategories: undefined as any,
      init: true,
    };
  },

  mounted() {
    if (undefined !== this.categorySelected) {
      this.initCategorySelected(this.categorySelected);
    }
    if (undefined !== this.categoryArray) {
      this.initCategoryArray(this.categoryArray);
    }
  },

  methods: {
    clearAll() {
      let ref:any = this.$refs.multiselectRef;
      ref.$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
      if (undefined === this.categoryArray) {
        this.category = '';
      }
      if (
        undefined !== this.categorySelected ||
        undefined !== this.categoryArray ||
        this.displayAllCategories
      ) {
        this.totalCategories = this.allCategories;
      } else {
        this.totalCategories = this.allCategories.filter((c: { podcastCount: any; }) => {
          return c.podcastCount;
        });
      }
      if (undefined !== this.defaultanswer) {
        this.categories = [getDefaultCategory(this.defaultanswer)].concat(
          this.totalCategories
        );
      } else {
        this.categories = this.totalCategories;
      }
    },

    onClose() {
      if (!this.category && undefined === this.categoryArray) {
        this.category = getDefaultCategory(this.defaultanswer);
        this.onEmissionSelected(this.category);
      }
    },

    onSearchCategory(query: string) {
      this.isLoading = true;
      let list = [getDefaultCategory(this.defaultanswer)].concat(
        this.totalCategories
      );
      if (undefined === this.defaultanswer) {
        list = this.totalCategories;
      }
      this.categories = list.filter((item:any) => {
        return item.name.toUpperCase().includes(query.toUpperCase());
      });
      this.isLoading = false;
    },

    onEmissionSelected(category: any) {
      if (undefined !== this.categorySelected) {
        this.$emit('update:categorySelected', category.id);
      } else if (undefined === this.categoryArray) {
        this.$emit('selected', category);
      }
    },
    initCategorySelected(val: any) {
      this.category = state.generalParameters.allCategories.find((el: { id: any; }) => {
        return el.id === val;
      });
    },
    initCategoryArray(val: any[]) {
      this.category.length = 0;
      val.forEach((element: any) => {
        let item = state.generalParameters.allCategories.find((el: { id: any; }) => {
          return el.id === element;
        });
        this.category.push(item);
      });
    },
  },
  watch: {
    categorySelected(newVal) {
      this.initCategorySelected(newVal);
    },
    category(newVal) {
      if (undefined === this.categoryArray) return;

      let idsArray: any[] = [];
      newVal.forEach((el: { id: any; }) => {
        idsArray.push(el.id);
      });
      this.$emit('selected', idsArray);
    },
  },
});
</script>
