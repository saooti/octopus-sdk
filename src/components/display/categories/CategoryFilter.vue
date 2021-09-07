<template>
  <div v-if="isDisplay">
    <nav aria-label="breadcrumb" v-if="categoryFilter">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="#" @click="removeFilter">{{$t('All')}}</a></li>
        <li class="breadcrumb-item active">{{ categoryFilter.name }}</li>
      </ol>
    </nav>
    <CategoryList :isFilter="true" v-else/>
  </div>
</template>

<style lang="scss">

</style>
<script lang="ts">
import Vue from 'vue';
import { Category } from '@/store/class/category';
export default Vue.extend({
  name: 'CategoryFilter',

  components:{
    CategoryList: () => import('./CategoryList.vue') as any,
  },
  computed: {
    categoryFilter(): Category|undefined{
      return this.$store.state.filter.iab;
    },
    isDisplay() {
      return "home" === this.$route.name ||"podcasts" === this.$route.name||"emissions" === this.$route.name;
    }
  },
  methods:{
    removeFilter(event: { preventDefault: () => void }): void{
      const queries = this.$route.query;
      if (queries.iabId) {
        this.$router.push({ query: {...queries, ...{iabId: undefined} } });
      }
      this.$store.commit('filterIab', undefined);
      event.preventDefault();
    }
  }
});
</script>
