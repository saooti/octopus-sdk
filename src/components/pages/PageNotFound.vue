<template>
  <div
    class="page-box page-box-absolute page-not-found"
    :style="backgroundStyle"
  >
    <div class="position-absolute module-box">
      <h1>{{ $t('Oops') }}</h1>
      <h2>{{ $t('The page you are looking for cannot be found') }}</h2>
      <router-link
        class="btn btn-primary"
        :to="{
          name: 'home',
          query: { productor: $store.state.filter.organisationId,
                   iabId: $store.state.filter.iab ? $store.state.filter.iab.id : undefined,
                   rubriquesId: rubriqueQueryParam},
        }"
      >
        {{ $t('Back to home') }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'PageNotFound',
  computed:{
    rubriqueQueryParam(): string|undefined{
      if(this.$store.state.filter && this.$store.state.filter.rubriqueFilter && this.$store.state.filter.rubriqueFilter.length){
        return this.$store.state.filter.rubriqueFilter.map((value: RubriquageFilter) =>  value.rubriquageId+':'+value.rubriqueId).join();
      }
      return undefined;
    },
    backgroundStyle():string{
      return "background-image: url('/img/404.svg');";
    },
  },
  mounted() {
    document.title = this.$store.state.general.metaTitle;
  },
});
</script>
<style lang="scss">
.octopus-app .page-not-found{
  background-size: cover;
  background-position: center;
  background-color: #ebebeb; 
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}
</style>