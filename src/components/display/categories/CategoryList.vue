<template>
  <div
    v-if="categories.length"
    class="d-inline-flex w-100 mb-3 ps-3 pe-3 hide-phone category-list"
  >
    <div
      id="category-list-container"
      class="category-list-container"
    >
      <button
        v-for="category in categories"
        :id="'category' + category.id"
        :key="category.id"
        class="category-item text-dark bg-white"
        @click="checkIfFilter(category)"
      >
        {{ category.name }}
      </button>
    </div>
    <div
      v-show="hidenCategories.length"
      class="dropdown btn-group"
    >
      <button
        class="btn dropdown-toggle admin-button dropdown-toggle-no-caret saooti-plus"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        :title="$t('See more')"
      />
      <ul class="dropdown-menu dropdown-menu-right px-4">
        <div
          v-for="category in hidenCategories"
          :key="category.id"
          class="me-3 dropdown-item"
          @click="checkIfFilter(category)"
        >
          {{ category.name }}
        </div>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';
import { state } from '../../../store/paramStore';

import { Category } from '@/store/class/general/category';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'CategoryList',

  props: {
    isFilter: { default: false, type: Boolean },
    isDisplay: { default: false, type: Boolean },
  },
  emits:['categoriesLength'],

  data() {
    return {
      hidenCategories: [] as Array<Category>,
    };
  },

  computed: {
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    categoriesWatch(): Array<Category>{
      return this.$store.state.categories;
    },
    categories(): Array<Category> {
      let arrayCategories: Array<Category>  = [];
      if (this.filterOrga) {
        arrayCategories = this.$store.state.categoriesOrga.filter((c: Category) => {
          return c.podcastOrganisationCount;
        });
      }else{
        arrayCategories = this.$store.state.categories.filter((c: Category) => {
          if (this.isPodcastmaker) return c.podcastOrganisationCount;
          return c.podcastCount;
        });
      }
      this.$emit('categoriesLength', arrayCategories.length);
      return arrayCategories;
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
  },
  watch: {
    isDisplay():void{
      this.$nextTick(() => {
        this.resizeWindow();
      });
    },
    categories: {
      deep: true,
      handler(){
        this.$nextTick(() => {
          this.resizeWindow();
        });
      }
    },
    filterOrga(): void {
      if (this.filterOrga) {
        this.fetchCategories(this.filterOrga);
      }
    },
    categoriesWatch:{
      deep: true,
      handler(){
      if (this.filterOrga) {
        this.fetchCategories(this.filterOrga);
      }
      }
    }
  },

  mounted() {
    window.addEventListener('resize', this.resizeWindow);
    this.resizeWindow();
    if (this.filterOrga) {
      this.fetchCategories(this.filterOrga);
    }
  },
  beforeUnmount(): void {
    window.removeEventListener('resize', this.resizeWindow);
  },
  methods: {
    checkIfFilter(category: Category): void{
      if(!this.isFilter){
        this.$router.push({
          name: 'category',
          params: { iabId: category.id.toString() },
          query: { productor: this.filterOrga },
        });
        return;
      }
      const queries = this.$route.query;
      if(!queries.iabId || ('string'===typeof queries.iabId &&  parseInt(queries.iabId ,10) !== category.id)) {
        this.$router.push({ query: { ...queries, ...{ iabId: category.id.toString() }} });
      }
      this.$store.commit('filterIab',category);
    },
    resizeWindow(): void {
      const categoryList = document.getElementById('category-list-container');
      if(null === categoryList){
        return;
      }
      categoryList.style.justifyContent = 'flex-start';
      this.hidenCategories.length = 0;
      this.categories.forEach((element: Category) => {
        const el = document.getElementById('category' + element.id);
        if (!el) return;
        const parent = el.parentElement;
        if (parent && el.offsetLeft + el.clientWidth <= parent.clientWidth - 20) {
          el.classList.remove('hid');
          return;
        }
        this.hidenCategories.push(element);
        if (!el.classList.contains('hid')) {
          el.className += ' hid';
        }
      });
      if (!this.hidenCategories.length) {
        categoryList.style.justifyContent = 'center';
      }
    },
    async fetchCategories(organisationId: string): Promise<void> {
      const data = await octopusApi.fetchCategories({
        lang: this.$i18n.locale,
      }, organisationId);
      this.$store.commit('categoriesOrgaSet', data);
    },
  },
})
</script>
<style lang="scss">
@import '../../../sass/_variables.scss';
.octopus-app{
  .category-list-container {
    display: inline-flex;
    justify-content: flex-start;
    overflow: hidden;
    flex-grow: 1;
    width: 0;
    padding: 0 4rem;
  }
  .category-item {
    font-size: 0.6rem;
    margin: 0.2rem;
    padding: 0.5rem;
    display: block;
    height: 1.5rem;
    border-radius: 1.5rem;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    flex-shrink: 0;
    .router-link-active,&:hover {
      background: $octopus-secondary-color !important;
    }
  }
}
</style>
