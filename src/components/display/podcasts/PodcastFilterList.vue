<template>
  <div class="p-3 list-episodes">
    <h2 v-if="name">{{ $t('All podcast button', { name: name }) }}</h2>
    <h2 v-else>{{ $t('All podcast emission button') }}</h2>
    <div class="d-flex align-items-center flex-wrap">
      <div
        class="d-flex align-items-center flex-grow categories-filter"
        v-if="categoryFilter"
      >
        <CategoryChooser
          :defaultanswer="$t('No category filter')"
          @selected="onCategorySelected"
        />
      </div>
      <div class="d-flex position-relative small-flex-grow">
        <label for="search" class="d-inline" :aria-label="$t('Search')"></label>
        <input
          :placeholder="$t('Search')"
          v-model="searchPattern"
          class="filter-search-input input-no-outline flex-grow"
          id="search"
        />
        <div
          class="saooti-search-bounty filter-list-search-icon search-icon-container"
        ></div>
      </div>
    </div>
    <PodcastList
      :first="first"
      :size="size"
      :iabId="iabId"
      :query="query"
      :participantId="participantId"
      :emissionId="emissionId"
      :organisationId="productorId"
      :reload="reloadList"
      :includeHidden="editRight"
      @fetch="fetch"
    />
  </div>
</template>

<style lang="scss">
.categories-filter {
  .multiselect {
    width: 75%;
    @media (max-width: 600px) {
      width: 100%;
    }
  }
}
.list-episodes {
  padding: 2rem 0.5rem 1rem !important;
  margin: 0 0.5rem;

  @media (max-width: 450px) {
    padding: 0.5rem 0rem 1rem !important;
  }
  h2 {
    margin-bottom: 0.5rem;
  }
}
.filter-list-search-icon {
  right: 1.6rem !important;
  font-weight: bold;
}
.small-flex-grow {
  flex-grow: 0.3;
}
</style>

<script>
// @ is an alias to /src
import CategoryChooser from '../categories/CategoryChooser.vue';
import PodcastList from './PodcastList.vue';

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    CategoryChooser,
    PodcastList,
  },

  created() {
    if (this.$route.query.first) {
      this.first = this.$route.query.first;
    } else {
      this.first = 0;
    }
    if (this.$route.query.size) {
      this.size = this.$route.query.size;
    } else {
      this.size = 12;
    }
  },

  props: [
    'participantId',
    'name',
    'emissionId',
    'categoryFilter',
    'productorId',
    'reload',
    'editRight',
  ],

  data() {
    return {
      first: undefined,
      size: undefined,
      searchPattern: '',
      iabId: undefined,
      reloadList: false,
    };
  },

  computed: {
    query() {
      if (this.searchPattern.length >= 3) return this.searchPattern;
      return '';
    },
  },

  methods: {
    onCategorySelected(category) {
      if (category && category.id) {
        this.iabId = category.id;
      } else {
        this.iabId = undefined;
      }
    },
    fetch(podcasts) {
      this.$emit('fetch', podcasts);
    },
  },

  watch: {
    reload() {
      this.reloadList = !this.reloadList;
    },
  },
});
</script>
