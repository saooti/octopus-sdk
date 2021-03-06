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

<script lang="ts">
// @ is an alias to /src
import PodcastList from './PodcastList.vue';
import { Category } from '@/store/class/category';
import Vue from 'vue';
export default Vue.extend({
  components: {
    CategoryChooser: () => import('../categories/CategoryChooser.vue'),
    PodcastList,
  },
  props: {
    participantId: { default: undefined as number|undefined},
    name: { default: undefined as string|undefined},
    emissionId: { default: undefined as number|undefined},
    categoryFilter: { default: false as boolean},
    reload: { default: false as boolean},
    editRight: { default: false as boolean},
    productorId: { default: undefined as string|undefined},
  },

   data() {
    return {
      first: 0 as number,
      size: 12 as number,
      searchPattern: '' as string,
      iabId: undefined as number | undefined,
      reloadList: false as boolean,
    };
  },
  created() {
    if (this.$route.query.first && 'string' === typeof this.$route.query.first) {
      this.first = parseInt(this.$route.query.first);
    }
    if (this.$route.query.size && 'string' === typeof this.$route.query.size) {
      this.size = parseInt(this.$route.query.size);
    }
  },
  computed: {
    query(): string {
      if (this.searchPattern.length >= 3) return this.searchPattern;
      return '';
    },
  },
  methods: {
    onCategorySelected(category: Category|undefined): void {
      if (category && category.id) {
        this.iabId = category.id;
      } else {
        this.iabId = undefined;
      }
    },
    fetch(podcasts: any): void {
      this.$emit('fetch', podcasts);
    },
  },
  watch: {
    reload(): void {
      this.reloadList = !this.reloadList;
    },
  },
});
</script>
