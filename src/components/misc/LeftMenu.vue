<template>
  <div
    v-show="displayMenu"
    class="left-menu-container"
  >
    <template
      v-for="link in routerLinkArray"
      :key="link.routeName"
    >
      <router-link
        v-if="link.condition"
        :class="'home'===link.routeName ? 'show-phone' : ''"
        :to="{
          name: link.routeName,
          query: getQueriesRouter(link.routeName),
        }"
        @click="onMenuClick"
      >
        {{ link.title }}
      </router-link>
    </template>
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
    routerLinkArray(){
      return [
        {title : this.$t('Home'), routeName: 'home', condition : true},
        {title : this.$t('Live'), routeName: 'lives', condition : state.generalParameters.isLiveTab &&((this.filterOrga && this.filterOrgaLive) || !this.filterOrga)},
        {title : this.$t('Podcasts'), routeName: 'podcasts', condition : true},
        {title : this.$t('Emissions'), routeName: 'emissions', condition : true},
        {title : this.$t('Productors'), routeName: 'productors', condition : !this.isPodcastmaker && (!this.filterOrga || this.isEducation)},
        {title : this.$t('Playlists'), routeName: 'playlists', condition : true},
        {title : this.$t('Speakers'), routeName: 'participants', condition : true},]
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
    filterOrga: {
      immediate: true,
      handler() {
        if (this.filterOrga) {
          this.organisationId = this.filterOrga;
        } else {
          this.reset = !this.reset;
        }
      },
    },
  },
  
  methods: {
    getQueriesRouter(routeName: string){
      if('podcasts' !== routeName && 'emissions' !== routeName && 'home' !== routeName){
        return { productor: this.$store.state.filter.organisationId};
      }
      return { productor: this.$store.state.filter.organisationId,
                   iabId: this.$store.state.filter.iab ? this.$store.state.filter.iab.id : undefined,
                   rubriquesId: this.rubriqueQueryParam}
    },
    onMenuClick() {
      this.$emit('update:displayMenu', false);
    },
    async onOrganisationSelected(organisation: Organisation|undefined) {
      if (organisation && organisation.id) {
        await this.selectOrganisation(organisation.id);
        return;
      }
      this.removeSelectedOrga();
    },
  },
})
</script>

<style lang="scss">
.octopus-app{
.left-menu-container {
  position: fixed;
  top: 3rem;
  bottom: 0;
  right: 0;
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
}
</style>