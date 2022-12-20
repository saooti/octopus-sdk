<template>
  <div class="py-3">
    <h2>{{ titleFilter }}</h2>
    <div class="d-flex align-items-center flex-wrap mb-2">
      <div
        class="d-flex align-items-center flex-grow-1 me-3"
      >
        <CategoryChooser
          :defaultanswer="$t('No category filter')"
          @selected="onCategorySelected"
        />
      </div>
      <ClassicSearch
        v-model:textInit="searchPattern"
        class="flex-small-grow"
        id-checkbox="podcast-filter-search"
        :label="$t('Search')"
      />
    </div>
    <PodcastList
      :first="first"
      :size="size"
      :iab-id="iabId"
      :query="query"
      :participant-id="participantId"
      :emission-id="emissionId"
      :organisation-id="productorId"
      :reload="reloadList"
      :include-hidden="editRight"
      :showCount="showCount"
      :displaySortText="false"
      @fetch="fetch"
    />
  </div>
</template>

<script lang="ts">
import ClassicSearch from '../../form/ClassicSearch.vue';
import PodcastList from './PodcastList.vue';
import { Category } from '@/store/class/general/category';
import { defineComponent, defineAsyncComponent } from 'vue';
import { Podcast } from '@/store/class/general/podcast';
const CategoryChooser = defineAsyncComponent(() => import('../categories/CategoryChooser.vue'));
export default defineComponent({
  components: {
    CategoryChooser,
    PodcastList,
    ClassicSearch
  },
  props: {
    participantId: { default: undefined, type: Number},
    name: { default: undefined, type: String},
    emissionId: { default: undefined, type: Number},
    categoryFilter: { default: false, type:  Boolean},
    reload: { default: false, type:  Boolean},
    editRight: { default: false, type:  Boolean},
    productorId: { default: undefined, type: String},
    showCount: { default: false, type: Boolean },
  },
  emits: ['fetch'],

  data() {
    return {
      first: 0 as number,
      size: 30 as number,
      searchPattern: '' as string,
      iabId: undefined as number | undefined,
      reloadList: false as boolean,
    };
  },

  computed: {
    titleFilter():string{
      return this.name ? this.$t('All podcast button', { name: this.name }) : this.$t('All podcast emission button');
    },
    query(): string {
      return this.searchPattern.length >= 3 ? this.searchPattern : '' ;
    },
  },
  watch: {
    reload(): void {
      this.reloadList = !this.reloadList;
    },
  },
  methods: {
    onCategorySelected(category: Category|undefined): void {
      this.iabId = category?.id ? category.id : undefined;
    },
    fetch(podcasts: Array<Podcast>): void {
      this.$emit('fetch', podcasts);
    },
  },
})
</script>