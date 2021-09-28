<template>
  <div
    class="top-bar-container position-sticky"
    v-bind:class="{ 'shadow-element': scrolled }"
    v-if="init"
  >
    <div class="top-bar">
      <div
        class="hamburger-menu"
        v-on:click="onDisplayMenu(false)"
        :aria-label="$t('open left Menu')"
      >
        <div class="saooti-burger-menu h3"></div>
      </div>
      <router-link
        :to="{
          name: 'home',
          query: { productor: $store.state.filter.organisationId,
                  iabId: $store.state.filter.iab ? $store.state.filter.iab.id : undefined,
                  rubriquesId: rubriqueQueryParam},
        }"
      >
        <div class="top-bar-logo m-3" v-on:click="onDisplayMenu(true)">
          <img
            :src="logoUrl"
            :alt="$t('Logo of main page')"
            :class="isEducation ? 'educationLogo' : ''"
            v-if="!filterOrga || '' === imgUrl"
          />
          <img :src="imgUrl" :alt="$t('Logo of main page')" v-else />
        </div>
      </router-link>
      <OrganisationChooserLight
        width="auto"
        page="topBar"
        :defaultanswer="$t('No organisation filter')"
        @selected="onOrganisationSelected"
        :value="organisationId"
        :light="true"
        class="mr-2 hide-top-bar"
        :reset="reset"
        v-if="!isPodcastmaker"
      />
      <div class="d-flex align-items-center justify-content-center flex-grow">
        <router-link
          v-if="
            isLiveTab &&
              ((filterOrga && filterOrgaLive) || !filterOrga)
          "
          :to="{
            name: 'lives',
            query: { productor: $store.state.filter.organisationId },
          }"
          class="linkHover p-3 text-dark font-weight-bold"
          >{{ $t('Live') }}</router-link
        >
        <router-link
          :to="{
            name: 'podcasts',
            query: { productor: $store.state.filter.organisationId,
                  iabId: $store.state.filter.iab ? $store.state.filter.iab.id : undefined,
                  rubriquesId: rubriqueQueryParam},
          }"
          class="linkHover p-3 text-dark font-weight-bold"
          >{{ $t('Podcasts') }}</router-link
        >
        <router-link
          :to="{
            name: 'emissions',
            query: { productor: $store.state.filter.organisationId,
                  iabId: $store.state.filter.iab ? $store.state.filter.iab.id : undefined,
                  rubriquesId: rubriqueQueryParam },
          }"
          class="linkHover p-3 text-dark font-weight-bold"
          >{{ $t('Emissions') }}</router-link
        >
        <router-link
          :to="{
            name: 'participants',
            query: { productor: $store.state.filter.organisationId },
          }"
          class="linkHover p-3 text-dark font-weight-bold"
          >{{ $t('Speakers') }}</router-link
        >
        <router-link
          :to="{
            name: 'playlists',
            query: { productor: $store.state.filter.organisationId },
          }"
          class="linkHover p-3 text-dark font-weight-bold"
          >{{ $t('Playlists') }}</router-link
        >
        <router-link
          :to="{
            name: 'productors',
            query: { productor: $store.state.filter.organisationId },
          }"
          class="linkHover p-3 text-dark font-weight-bold"
          v-if="!isPodcastmaker && (!filterOrga || isEducation)"
          >{{ $t('Productors') }}</router-link
        >
      </div>
      <div class="d-flex flex-column">
        <div class="d-flex justify-content-end hostedBy hide-phone">
          <span>{{ $t('Hosted by') }}</span
          ><span class="ml-1 mr-1 primary-color">Saooti</span>
        </div>
        <div class="d-flex align-items-center justify-content-end flex-no-wrap">
          <HomeDropdown :isEducation="isEducation" />
          <router-link
            :aria-label="$t('Search')"
            :to="{
              name: 'podcasts',
              query: { productor: $store.state.filter.organisationId },
            }"
          >
            <div class="btn admin-button m-1">
              <i class="saooti-search text-dark"></i>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.top-bar-container {
  top: 0;
  background: #fff;
  width: 100%;
  z-index: 10;
  padding: 0 2em;

  @media (max-width: 450px) {
    padding: 0 0.5rem;
  }

  .top-bar {
    transition: height 1s;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    height: 5rem;
    position: relative;

    .top-bar-logo {
      margin: 1rem 2rem 1rem 1rem !important;
      img {
        max-width: 160px !important;
        max-height: 80px;
        height: 80px;
        border-radius: 0.8rem;
        &.educationLogo {
          height: auto;
          border-radius: 0;
        }
      }
    }
    .multiselect__tags {
      padding: 6px 40px 0 10px;
    }

    .hamburger-menu {
      display: none;
      margin: 0 1rem;
      @media (max-width: 600px) {
        margin: 0;
      }
      .saooti-burger-menu {
        font-size: 2.2em;
        font-weight: bold;
        margin-bottom: 0;
      }
      cursor: pointer;
    }
  }

  &.shadow-element {
    .linkHover {
      display: none;
    }
    .top-bar {
      height: 3.5rem;

      .hamburger-menu {
        display: block;
        .saooti-burger-menu {
          font-size: 2.2em;
          font-weight: bold;
          margin: 0;
        }
      }
      .top-bar-logo {
        flex-grow: 1;
        text-align: center;
        align-items: center;
        display: flex;
        img {
          height: 2.5rem;
          width: auto;
        }
      }
      .hostedBy {
        display: none !important;
      }
    }
  }
  .hostedBy {
    font-size: 0.6rem;
    position: absolute;
    top: 5px;
    right: 0;
  }

  /** PHONES*/
  @media (max-width: 1200px) {
    .hide-top-bar {
      display: none !important;
    }
    .hostedBy {
      display: none !important;
    }
    .top-bar {
      padding: 0;
      height: 3.5rem;
      .linkHover {
        display: none;
      }
      .hamburger-menu {
        flex-grow: 1;
        display: block;
      }
      .top-bar-logo {
        flex-grow: 1;
        text-align: center;
        display: flex;
        width: 100px;
        img {
          max-width: 100px !important;
        }
      }
    }
  }
  @media (max-width: 650px) {
    .top-bar {
      .top-bar-logo {
        img {
          height: 2rem;
        }
      }
    }
  }
  @media (max-width: 290px) {
    .top-bar {
      .top-bar-logo {
        img {
          display: none;
        }
      }
    }
  }
}
</style>

<script lang="ts">
import { state } from '../../store/paramStore';
import HomeDropdown from './HomeDropdown.vue';
import { Organisation } from '@/store/class/organisation';
import { orgaFilter } from '../mixins/organisationFilter';
import { RubriquageFilter } from '@/store/class/rubriquageFilter';
export default {
  name: 'TopBar',
  mixins:[orgaFilter],

  components: {
    OrganisationChooserLight: () => import('../display/organisation/OrganisationChooserLight.vue'),
    HomeDropdown,
  },

  props: {
    displayMenu: { default: false as boolean},
    isEducation: { default: false as boolean},
  },
  emits: ['update:displayMenu'],

  data() {
    return {
      scrolled: false as boolean,
      oldScrollY: 0 as number,
      minScroll: 0 as number,
      organisationId: undefined as string | undefined,
      reset: false as boolean,
      init: false as boolean,
      dummyParam: new Date().getTime().toString() as string,
    };
  },

  mounted() {
    if (this.filterOrga) {
      this.organisationId = this.filterOrga;
    }
    this.init = true;
    window.addEventListener('scroll', this.handleScroll);
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },

 
  computed: {
    rubriqueQueryParam(): string|undefined{
      if(this.$store.state.filter && this.$store.state.filter.rubriqueFilter && this.$store.state.filter.rubriqueFilter.length){
        return this.$store.state.filter.rubriqueFilter.map((value: RubriquageFilter) =>  value.rubriquageId+':'+value.rubriqueId).join();
      }
      return undefined;
    },
    logoUrl(): string {
      if (this.isEducation) return '/img/logo_education.png';
      return '/img/logo_octopus_final.svg';
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    isLiveTab(): boolean {
      return state.generalParameters.isLiveTab;
    },
    filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
    filterOrgaLive(): string {
      return this.$store.state.filter.live;
    },
    imgUrl(): string {
      if (
        this.$store.state.filter.imgUrl &&
        !this.$store.state.filter.imgUrl.includes('emptypodcast')
      )
        return this.$store.state.filter.imgUrl + '?dummy=' + this.dummyParam;
      return '';
    },
  },
  methods: {
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
      if (true === param) {
        this.$emit('update:displayMenu', false);
      } else {
        this.$emit('update:displayMenu', !this.displayMenu);
      }
    },
    async onOrganisationSelected(organisation: Organisation | undefined): Promise<void> {
      const queries = this.$route.query;
      if (organisation && organisation.id) {
        if (this.$route.query.productor !== organisation.id) {
          this.$router.push({ query: {...queries, ...{productor: organisation.id} } });
        }
        await this.selectOrganisation(organisation.id);
      } else {
        this.organisationId = undefined;
        if (this.$route.query.productor) {
          this.$router.push({ query: { ...queries, ...{productor: undefined} } });
        }
        this.$store.commit('filterOrga', { orgaId: undefined });
      }
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
};
</script>
