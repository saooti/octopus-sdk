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
      width="100%"
      :defaultanswer="$t('No category filter')"
    />
  </div>
</template>

<script lang="ts">
import ClassicCheckbox from '../../form/ClassicCheckbox.vue';
import CategoryChooser from '../categories/CategoryChooser.vue';
import { useFilterStore } from '@/stores/FilterStore';
import { mapState, mapActions } from 'pinia';
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
    ...mapState(useFilterStore, ['filterIab']),
  },
  watch: {
    isCategory(): void {
      if(this.isInternChanged ||this.isInit){
        return;
      }
      this.isInternChanged = true;
      this.$emit('updateCategory', this.isCategory?this.iabId:0);
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
    filterIab:{
      deep: true,
      handler(){
        if(this.isInternChanged){
          return;
        }
        this.isInternChanged = true;
        this.iabId = this.filterIab ? this.filterIab.id : 0;
        this.isCategory = this.filterIab ? true : false;
        this.$emit('updateCategory', this.iabId);
        this.$nextTick(() => {
          this.isInternChanged = false;
        });
      }
    },
  },

  created() {
    if(this.filterIab){
      this.iabId = this.filterIab.id;
      this.isCategory = true;
    }
    this.$nextTick(() => {
      this.isInit = false;
    });
  },
  methods: {
    ...mapActions(useFilterStore, ['filterUpdateIab']),
    resetCategoryFilter(): void{
      if(!this.filterIab || this.isInit){
        return;
      }
      const queries = this.$route.query;
      if (queries.iabId) {
        this.$router.replace({ query: {...queries, ...{iabId: undefined} } });
      }
      this.filterUpdateIab();
    }
  },
})
</script>
