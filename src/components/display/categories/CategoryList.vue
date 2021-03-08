<template>
  <div class="d-inline-flex w-100 mb-3 pl-3 pr-3 hide-phone category-list">
    <div class="category-list-container" id="category-list-container">
      <router-link
        :id="'category' + category.id"
        :to="{
          name: 'category',
          params: { iabId: category.id },
          query: { productor: filterOrga },
        }"
        class="category-item text-dark secondary-bg"
        v-for="category in categories"
        v-bind:key="category.id"
        >{{ category.name }}</router-link
      >
    </div>
    <b-dropdown
      v-show="hidenCategories.length"
      right
      toggle-class="text-decoration-none text-dark category-item category-item-plus"
      no-caret
      :aria-label="$t('See more')"
    >
      <template v-slot:button-content>
        <i :aria-label="$t('See more')" class="saooti-plus"></i>
      </template>
      <template>
        <b-dropdown-item
          :to="{
            name: 'category',
            params: { iabId: category.id },
            query: { productor: filterOrga },
          }"
          v-for="category in hidenCategories"
          v-bind:key="category.id"
          class="mr-3"
          >{{ category.name }}</b-dropdown-item
        >
      </template>
    </b-dropdown>
  </div>
</template>

<style lang="scss">
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
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex-shrink: 0;
  .router-link-active {
    background: #ddd !important;
  }
  &:hover {
    background: #ddd !important;
  }
}

.category-list .category-item-plus {
  display: flex;
  height: 1.5rem;
  width: 1.5rem;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
}
</style>
<script>
import octopusApi from '@saooti/octopus-api';
import { state } from '../../../store/paramStore.js';

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'CategoryList',

  mounted() {
    window.addEventListener('resize', this.resizeWindow);
    this.resizeWindow();
    if (this.filterOrga) {
      this.fetchCategories(this.filterOrga);
    }
  },

  data() {
    return {
      hidenCategories: [],
    };
  },

  computed: {
    isPodcastmaker() {
      return state.generalParameters.podcastmaker;
    },
    categories() {
      if (this.filterOrga) {
        return this.$store.state.categoriesOrga.filter(c => {
          return c.podcastOrganisationCount;
        });
      }
      return state.generalParameters.allCategories.filter(c => {
        if (this.isPodcastmaker) return c.podcastOrganisationCount;
        return c.podcastCount;
      });
    },
    filterOrga() {
      return this.$store.state.filter.organisationId;
    },
  },

  methods: {
    resizeWindow() {
      let categoryList = document.getElementById('category-list-container');
      categoryList.style.justifyContent = 'flex-start';
      this.hidenCategories.length = 0;
      this.categories.forEach(element => {
        let el = document.getElementById('category' + element.id);
        if (!el) return;
        const parent = el.parentNode;
        if (el.offsetLeft + el.clientWidth <= parent.clientWidth - 20) {
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
    async fetchCategories(organisationId) {
      const data = await octopusApi.fetchCategoriesOrga(organisationId, {
        lang: 'fr',
      });
      this.$store.commit('categoriesOrgaSet', data);
    },
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.resizeWindow);
  },

  watch: {
    categories() {
      this.$nextTick(() => {
        this.resizeWindow();
      });
    },
    filterOrga(newVal) {
      if (newVal) {
        this.fetchCategories(newVal);
      }
    },
  },
});
</script>
