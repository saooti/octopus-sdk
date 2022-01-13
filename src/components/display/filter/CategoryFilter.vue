<template>
  <div class="d-flex mt-3 align-items-center">
    <ClassicCheckbox
      v-model:textInit="isCategory"
      class="flex-shrink-0 me-2"
      id-checkbox="search-category-checkbox"
      :label="$t('By category')"
    />
    <CategoryChooser
      v-model:categorySelected="iabId"
      width="auto"
      :defaultanswer="$t('No category filter')"
    />
  </div>
</template>

<script lang="ts">
import ClassicCheckbox from '../../form/ClassicCheckbox.vue';
import CategoryChooser from '../categories/CategoryChooser.vue';
import { Category } from '@/store/class/general/category';
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    CategoryChooser,
    ClassicCheckbox
  },
  emits: ['updateCategory'],
  data() {
    return {
      isCategory: false as boolean,
      iabId: 0 as number,
      isInternChanged: false as boolean,
      isInit: true as boolean,
    };
  },
  computed: {
    categoryFilter(): Category|undefined{
      return this.$store.state.filter.iab;
    },
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
    categoryFilter:{
      deep: true,
      handler(){
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
      }
    },
  },

  created() {
    if(this.categoryFilter){
      this.iabId = this.categoryFilter.id;
      this.isCategory = true;
    }
    this.$nextTick(() => {
      this.isInit = false;
    });
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
})
</script>
