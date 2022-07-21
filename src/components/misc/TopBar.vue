<template>
  <div
    class="top-bar-container"
    :class="{ 'shadow-element': scrolled }"
  >
    <router-link
      class="top-bar-logo"
      :to="{
        name: 'home',
        query: { productor: $store.state.filter.organisationId,
                 iabId: $store.state.filter.iab?.id ,
                 rubriquesId: rubriqueQueryParam},
      }"
      @click="onDisplayMenu(true)"
    >
      <img
        :src="!filterOrga || '' === imgUrl ? logoUrl : imgUrl"
        :alt="$t('Logo of main page')"
        :class="isEducation ? 'educationLogo' : ''"
      >
    </router-link>
    <OrganisationChooserLight
      v-if="!isPodcastmaker"
      page="topBar"
      width="auto"
      :defaultanswer="$t('No organisation filter')"
      :value="organisationId"
      class="me-2"
      :reset="reset"
      @selected="onOrganisationSelected"
    />
    <div class="d-flex justify-content-end flex-grow-1">
      <template
        v-for="link in routerLinkArray"
        :key="link.routeName"
      >
        <router-link
          v-if="link.condition"
          :to="{
            name: link.routeName,
            query: getQueriesRouter(link.routeName),
          }"
          class="link-hover p-3 fw-bold"
        >
          {{ link.title }}
        </router-link>
      </template>
    </div>
    <button
      class="btn-transparent saooti-menu"
      :title="$t('open left Menu')"
      @click="onDisplayMenu(false)"
    />
    <div class="d-flex flex-column">
      <div class="hosted-by">
        <span>{{ $t('Hosted by') }}</span><span class="ms-1 me-1 primary-darker">Saooti</span>
      </div>
      <div class="d-flex justify-content-end flex-nowrap">
        <HomeDropdown :is-education="isEducation" />
        <router-link
          :title="$t('Search')"
          :to="{
            name: 'podcasts',
            query: { productor: $store.state.filter.organisationId },
          }"
          class="btn admin-button m-1 saooti-search"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { state } from '../../store/paramStore';
import HomeDropdown from './HomeDropdown.vue';
import { Organisation } from '@/store/class/general/organisation';
import { orgaFilter } from '../mixins/organisationFilter';
import { RubriquageFilter } from '@/store/class/rubrique/rubriquageFilter';
import { defineComponent,defineAsyncComponent } from 'vue';
const OrganisationChooserLight = defineAsyncComponent(() => import('../display/organisation/OrganisationChooserLight.vue'));
export default defineComponent({
  name: 'TopBar',
  components: {
    OrganisationChooserLight,
    HomeDropdown,
  },
  mixins:[orgaFilter],
  props: {
    displayMenu: { default: false, type: Boolean},
    isEducation: { default: false, type: Boolean},
  },
  emits: ['update:displayMenu'],
  data() {
    return {
      scrolled: false as boolean,
      oldScrollY: 0 as number,
      minScroll: 0 as number,
      organisationId: undefined as string | undefined,
      reset: false as boolean,
      dummyParam: new Date().getTime().toString() as string,
    };
  },
  computed: {
    routerLinkArray(){
      return [
        {title : this.$t('Live'), routeName: 'lives', condition : (state.generalParameters.isLiveTab as boolean) &&((this.filterOrga && this.filterOrgaLive) || !this.filterOrga)},
        {title : this.$t('Podcasts'), routeName: 'podcasts', condition : true},
        {title : this.$t('Emissions'), routeName: 'emissions', condition : true},
        {title : this.$t('Speakers'), routeName: 'participants', condition : true},
        {title : this.$t('Playlists'), routeName: 'playlists', condition : true},
        {title : this.$t('Productors'), routeName: 'productors', condition : !this.isPodcastmaker && (!this.filterOrga || this.isEducation)}]
    },
    rubriqueQueryParam(): string|undefined{
      if(this.$store.state.filter?.rubriqueFilter?.length){
        return this.$store.state.filter.rubriqueFilter.map((value: RubriquageFilter) =>  value.rubriquageId+':'+value.rubriqueId).join();
      }
      return undefined;
    },
    logoUrl(): string {
      return this.isEducation ?'/img/logo_education.png': '/img/logo_octopus_final.svg';
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
    imgUrl(): string {
      if (!this.$store.state.filter.imgUrl?.includes('emptypodcast'))
        return `${this.$store.state.filter.imgUrl}?dummy=${this.dummyParam}`;
      return '';
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
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    getQueriesRouter(routeName: string){
      if('podcasts' !== routeName && 'emissions' !== routeName){
        return { productor: this.$store.state.filter.organisationId};
      }
      return { productor: this.$store.state.filter.organisationId,
                   iabId: this.$store.state.filter.iab?.id,
                   rubriquesId: this.rubriqueQueryParam}
    },
    handleScroll(): void {
      if (
        window.scrollY - this.oldScrollY > 0 &&
        window.scrollY > 1 &&
        document.body.offsetHeight - window.innerHeight > 40
      ) {
        this.scrolled = true;
        this.minScroll = 0;
      } else if (
        window.scrollY - this.oldScrollY < 0 &&
        window.scrollY < 1 &&
        this.minScroll > 20
      ) {
        this.scrolled = false;
        this.minScroll = 0;
      }
      this.oldScrollY = window.scrollY;
      if (this.minScroll < window.scrollY) {
        this.minScroll = window.scrollY;
      }
      if (!this.scrolled) {
        this.$emit('update:displayMenu', false);
      }
    },
    onDisplayMenu(param: boolean): void {
      this.$emit('update:displayMenu',param?false:!this.displayMenu);
    },
    async onOrganisationSelected(organisation: Organisation | undefined): Promise<void> {
      if (organisation?.id) {
        await this.selectOrganisation(organisation.id);
        return;
      }
      this.organisationId = undefined;
      this.removeSelectedOrga();
    },
  },
})
</script>

<style lang="scss">
.octopus-app{
.top-bar-container {
  position: sticky;
  top: 0;
  background: #fff;
  width: 100%;
  height: 5rem;
  z-index: 10;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: height 1s;
  @media (max-width: 450px) {
    padding: 0 0.5rem;
  }

  .saooti-menu {
    display: none;
    cursor: pointer;
    font-size: 2rem;
    font-weight: bold;
    margin: 0.5rem;
  }

  .top-bar-logo {
    margin: 1rem 2rem 1rem 1rem;
    img {
      max-width: 160px !important;
      max-height: 2.5rem;
      height: 2.5rem;
      &.educationLogo {
        height: auto;
      }
    }
  }
  .hosted-by {
    font-size: 0.6rem;
    position: absolute;
    top: 5px;
    right: 0;
  }
  .multiselect__tags {
    padding: 6px 40px 0 10px;
  }
  &.shadow-element {
    height: 3.5rem;
    .link-hover,.hosted-by {
      display: none;
    }
    .saooti-menu {
      display: block;
    }
  }
  /** PHONES*/
  @media (max-width: 1470px) {
    height: 3.5rem;
    .default-multiselect-width, .hosted-by, .link-hover {
      display: none;
    }
    .saooti-menu {
      display: block;
    }
  }
  @media (max-width: 650px) {
    .top-bar-logo img{
      height: 2rem;
    }
  }
  @media (max-width: 380px) {
    .top-bar-logo img{
      height: 1rem;
    }
  }
  @media (max-width: 290px) {
    .top-bar-logo{
      display: none;
    }
  }
}
}
</style>