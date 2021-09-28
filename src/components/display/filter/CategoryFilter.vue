<template>
  <div class="d-flex mt-3 align-items-center">
    <div class="checkbox-saooti flex-shrink mr-2">
      <input
        type="checkbox"
        class="custom-control-input"
        id="search-category-checkbox"
        v-model="isCategory"
      />
      <label class="custom-control-label" for="search-category-checkbox">{{ $t('By category') }}</label>
    </div>
    <CategoryChooser
      width="auto"
      v-model:categorySelected="iabId"
      :defaultanswer="$t('No category filter')"
    />
  </div>
</template>
<style lang="scss">
</style>
<script lang="ts">
// @ is an alias to /src
import CategoryChooser from '../categories/CategoryChooser.vue';
import { Category } from '@/store/class/category';
export default {
  components: {
    CategoryChooser
  },
  data() {
    return {
      isCategory: false as boolean,
      iabId: 0 as number,
      isInternChanged: false as boolean,
      isInit: true as boolean,
    };
  },
  emits: ['updateCategory'],

  created() {
    if(this.categoryFilter){
      this.iabId = this.categoryFilter.id;
      this.isCategory = true;
    }
    this.$nextTick(() => {
      this.isInit = false;
    });
  },
  computed: {
    categoryFilter(): Category|undefined{
      return this.$store.state.filter.iab;
    },
  },
  methods: {
    resetCategoryFilter(): void{
      if(!this.categoryFilter || this.isInit){
        return;
      }
      const queries = this.$route.query;
      if (queries.iabId) {
        this.$router.push({ query: {...queries, ...{iabId: undefined} } });
      }
      this.$store.commit('filterIab', undefined);
    }
  },
  watch: {
    isCategory(): void {
      if(this.isInternChanged ||this.isInit){
        return;
      }
      this.isInternChanged = true;
      if (this.isCategory) {
        this.$emit('updateCategory', this.iabId);
      } else {
        this.$emit('updateCategory', 0); 
      }
      this.resetCategoryFilter();
      this.$nextTick(() => {
        this.isInternChanged = false;
      });
    },
    iabId(): void {
      if(this.isInternChanged ||this.isInit){
        return;
      }
      this.isInternChanged = true;
      this.resetCategoryFilter();
      if(this.isCategory){
        this.$emit('updateCategory', this.iabId);
      }
      this.$nextTick(() => {
        this.isInternChanged = false;
      });
    },
    categoryFilter(): void{
      if(this.isInternChanged){
        return;
      }
      this.isInternChanged = true;
      if(this.categoryFilter){
        this.iabId = this.categoryFilter.id;
        this.isCategory = true;
      }else{
        this.iabId = 0;
        this.isCategory = false;
      }
      this.$emit('updateCategory', this.iabId);
      this.$nextTick(() => {
        this.isInternChanged = false;
      });
    },
  },
};
</script>
