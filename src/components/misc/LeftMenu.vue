<template>
  <div
    v-show="displayMenu"
    class="left-menu-container"
  >
    <router-link
      class="show-phone"
      :to="{
        name: 'home',
        query: { productor: $store.state.filter.organisationId,
                 iabId: $store.state.filter.iab ? $store.state.filter.iab.id : undefined,
                 rubriquesId: rubriqueQueryParam},
      }"
      @click="onMenuClick"
    >
      {{ $t('Home') }}
    </router-link>
    <router-link
      v-if="isLiveTab && filterOrga && filterOrgaLive"
      :to="{
        name: 'lives',
        query: { productor: $store.state.filter.organisationId},
      }"
      @click="onMenuClick"
    >
      {{ $t('Live') }}
    </router-link>
    <router-link
      :to="{
        name: 'podcasts',
        query: { productor: $store.state.filter.organisationId,
                 iabId: $store.state.filter.iab ? $store.state.filter.iab.id : undefined,
                 rubriquesId: rubriqueQueryParam},
      }"
      @click="onMenuClick"
    >
      {{ $t('Podcasts') }}
    </router-link>
    <router-link
      :to="{
        name: 'emissions',
        query: { productor: $store.state.filter.organisationId,
                 iabId: $store.state.filter.iab ? $store.state.filter.iab.id : undefined ,
                 rubriquesId: rubriqueQueryParam},
      }"
      @click="onMenuClick"
    >
      {{ $t('Emissions') }}
    </router-link>
    <router-link
      v-if="!isPodcastmaker && (!filterOrga || isEducation)"
      :to="{
        name: 'productors',
        query: { productor: $store.state.filter.organisationId },
      }"
      @click="onMenuClick"
    >
      {{ $t('Productors') }}
    </router-link>
    <router-link
      :to="{
        name: 'participants',
        query: { productor: $store.state.filter.organisationId },
      }"
      @click="onMenuClick"
    >
      {{ $t('Speakers') }}
    </router-link>
    <router-link
      :to="{
        name: 'playlists',
        query: { productor: $store.state.filter.organisationId },
      }"
      @click="onMenuClick"
    >
      {{ $t('Playlists') }}
    </router-link>
    <OrganisationChooserLight
      v-if="!isPodcastmaker"
      width="auto"
      page="leftMenu"
      :defaultanswer="$t('No organisation filter')"
      :value="organisationId"
      :reset="reset"
      @selected="onOrganisationSelected"
    />
    <hr class="show-phone">
    <router-link
      v-for="category in categories"
      :key="category.id"
      class="show-phone"
      :to="{
        name: 'category',
        params: { iabId: category.id },
        query: { productor: $store.state.filter.organisationId },
      }"
      @click="onMenuClick"
    >
      {{ category.name }}
    </router-link>
  </div>
</template>

<script lang="ts">
import { state } from '../../store/paramStore';
import { orgaFilter } from '../mixins/organisationFilter';
import { Category } from '@/store/class/general/category';
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';
import { defineComponent, defineAsyncComponent } from 'vue';
import { Organisation } from '@/store/class/general/organisation';
const OrganisationChooserLight = defineAsyncComponent(() => import('../display/organisation/OrganisationChooserLight.vue'));
export default defineComponent({
  name: 'LeftMenu',

  components: {
    OrganisationChooserLight,
  },
  mixins:[orgaFilter],

  props: {
    displayMenu: { default: false, type: Boolean},
    isEducation: { default: false, type: Boolean},
  },
  emits: ['update:displayMenu'],

  data() {
    return {
      organisationId: undefined as string|undefined,
      reset: false as boolean,
    };
  },

  computed: {
    isLiveTab(): boolean {
      return (state.generalParameters.isLiveTab as boolean);
    },
    categories(): Array<Category> {
      return this.$store.state.categories.filter((c: Category) => {
        if (this.isPodcastmaker) return c.podcastOrganisationCount;
        return c.podcastCount;
      });
    },
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    filterOrgaLive(): string {
      return this.$store.state.filter.live;
    },
    rubriqueQueryParam(): string|undefined{
      if(this.$store.state.filter && this.$store.state.filter.rubriqueFilter && this.$store.state.filter.rubriqueFilter.length){
        return this.$store.state.filter.rubriqueFilter.map((value: RubriquageFilter) =>  value.rubriquageId+':'+value.rubriqueId).join();
      }
      return undefined;
    },
  },
  watch: {
    filterOrga(): void {
      if (this.filterOrga) {
        this.organisationId = this.filterOrga;
      } else {
        this.reset = !this.reset;
      }
    },
  },

  mounted() {
    if (this.filterOrga) {
      this.organisationId = this.filterOrga;
    }
  },
  
  methods: {
    onMenuClick() {
      this.$emit('update:displayMenu', false);
    },
    async onOrganisationSelected(organisation: Organisation|undefined) {
      const queries = this.$route.query;
      if (organisation && organisation.id) {
        if (queries.productor !== organisation.id) {
          this.$router.push({ query: {...queries, ...{productor: organisation.id} } });
        }
        await this.selectOrganisation(organisation.id);
      } else {
        if (this.$route.query.productor) {
          this.$router.push({ query: {...queries, ...{productor: undefined} } });
        }
        this.$store.commit('filterOrga', { orgaId: undefined });
      }
    },
  },
})
</script>

<style lang="scss">
.left-menu-container {
  position: fixed;
  top: 3rem;
  bottom: 0;
  left: 0;
  z-index: 10;
  background: #fff;
  width: 20%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;

  a{
    color: black !important;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  /** PHONES*/
  @media (max-width: 960px) {
    width: 75%;
    max-height: 80%;
    top: 2.5rem;
    overflow-y: auto;
    height: 100%;
  }
  @media (max-width: 450px) {
    width: 94%;
  }
}
</style>