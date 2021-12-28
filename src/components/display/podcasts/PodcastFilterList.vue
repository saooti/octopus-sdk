<template>
  <div class="p-3">
    <h2>
      <template v-if="name">
        {{ $t('All podcast button', { name: name }) }}
      </template>
      <template v-else>
        {{ $t('All podcast emission button') }}
      </template>
    </h2>
    <div class="d-flex align-items-center flex-wrap">
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
  },
  emits: ['fetch'],

  data() {
    return {
      first: 0 as number,
      size: 12 as number,
      searchPattern: '' as string,
      iabId: undefined as number | undefined,
      reloadList: false as boolean,
    };
  },
  computed: {
    query(): string {
      if (this.searchPattern.length >= 3) return this.searchPattern;
      return '';
    },
  },
  watch: {
    reload(): void {
      this.reloadList = !this.reloadList;
    },
  },
  methods: {
    onCategorySelected(category: Category|undefined): void {
      if (category && category.id) {
        this.iabId = category.id;
        return;
      }
      this.iabId = undefined;
    },
    fetch(podcasts: Array<Podcast>): void {
      this.$emit('fetch', podcasts);
    },
  },
})
</script>

<style lang="scss"></style>