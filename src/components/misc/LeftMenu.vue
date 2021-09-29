<template>
  <div
    v-show="displayMenu"
    class="left-menu-container"
  >
    <div class="routes-container h5">
      <router-link
        class="text-dark font-weight-bold mb-3 show-phone home-route"
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
        class="text-dark font-weight-bold mb-3 live-route"
        :to="{
          name: 'lives',
          query: { productor: $store.state.filter.organisationId},
        }"
        @click="onMenuClick"
      >
        {{ $t('Live') }}
      </router-link>
      <router-link
        class="text-dark font-weight-bold mb-3 podcasts-route"
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
        class="text-dark font-weight-bold mb-3 emissions-route"
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
        class="text-dark font-weight-bold mb-3 productors-route"
        :to="{
          name: 'productors',
          query: { productor: $store.state.filter.organisationId },
        }"
        @click="onMenuClick"
      >
        {{ $t('Productors') }}
      </router-link>
      <router-link
        class="text-dark font-weight-bold mb-3 participants-route"
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
        class="linkHover pb-3 text-dark font-weight-bold playlists-route"
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
        :light="true"
        class="mr-2 hide-top-bar"
        :reset="reset"
        @selected="onOrganisationSelected"
      />
      <hr class="divided-line show-phone">
      <router-link
        v-for="category in categories"
        :key="category.id"
        class="text-dark font-weight-bold mb-3 show-phone category-route"
        :to="{
          name: 'category',
          params: { iabId: category.id },
          query: { productor: $store.state.filter.organisationId },
        }"
        @click="onMenuClick"
      >
        {{ category.name }}
      </router-link>
      <div class="d-flex hostedBy">
        <span>{{ $t('Hosted by') }}</span><span class="ml-1 mr-1 primary-color">Saooti</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { state } from '../../store/paramStore';
import { orgaFilter } from '../mixins/organisationFilter';
import { Category } from '@/store/class/category';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
import { defineComponent, defineAsyncComponent } from 'vue';
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
      return state.generalParameters.isLiveTab;
    },
    categories(): Array<Category> {
      return this.$store.state.categories.filter((c: Category) => {
        if (this.isPodcastmaker) return c.podcastOrganisationCount;
        return c.podcastCount;
      });
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
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
    async onOrganisationSelected(organisation: any) {
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

  .routes-container {
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
  }
  .hostedBy {
    font-size: 0.6rem;
    position: absolute;
    bottom: 10px;
    right: 0;
  }
}
/** PHONES*/
@media (max-width: 960px) {
  .left-menu-container {
    width: 75%;
    max-height: 80%;
    left: 0.5rem;
    top: 2.5rem;
    padding-left: 1rem;
    font-size: 0.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 0.2rem 1rem rgba(79, 83, 90, 0.3);

    .routes-container {
      overflow-y: scroll;
      height: 100%;
    }
  }
  .divided-line {
    margin: 0.5rem 0;
    border-top: 1px solid lightgray;
  }
}
@media (max-width: 450px) {
  .left-menu-container {
    width: 94%;
    font-size: 0.3rem;
    padding: 2rem 0 1.5rem 1rem;
  }
}
</style>