<template>
  <div class="left-menu-container" v-show="displayMenu">
    <div class="routes-container h5">
      <router-link
        @click="onMenuClick"
        class="text-dark font-weight-bold mb-3 show-phone"
        :to="{
          name: 'home',
          query: { productor: $store.state.filter.organisationId },
        }"
        >{{ $t('Home') }}</router-link
      >
      <router-link
        @click="onMenuClick"
        v-if="isLiveTab && !isPodcastmaker && filterOrga && filterOrgaLive"
        class="text-dark font-weight-bold mb-3"
        :to="{
          name: 'lives',
          query: { productor: $store.state.filter.organisationId },
        }"
        >{{ $t('Live') }}</router-link
      >
      <router-link
        @click="onMenuClick"
        class="text-dark font-weight-bold mb-3"
        :to="{
          name: 'podcasts',
          query: { productor: $store.state.filter.organisationId },
        }"
        >{{ $t('Podcasts') }}</router-link
      >
      <router-link
        @click="onMenuClick"
        class="text-dark font-weight-bold mb-3"
        :to="{
          name: 'emissions',
          query: { productor: $store.state.filter.organisationId },
        }"
        >{{ $t('Emissions') }}</router-link
      >
      <router-link
        @click="onMenuClick"
        v-if="!isPodcastmaker && (!filterOrga || isEducation)"
        class="text-dark font-weight-bold mb-3"
        :to="{
          name: 'productors',
          query: { productor: $store.state.filter.organisationId },
        }"
        >{{ $t('Productors') }}</router-link
      >
      <router-link
        @click="onMenuClick"
        class="text-dark font-weight-bold mb-3"
        :to="{
          name: 'participants',
          query: { productor: $store.state.filter.organisationId },
        }"
        >{{ $t('Speakers') }}</router-link
      >
      <router-link
        :to="{
          name: 'playlists',
          query: { productor: $store.state.filter.organisationId },
        }"
        class="linkHover pb-3 text-dark font-weight-bold"
        >{{ $t('Playlists') }}</router-link
      >
      <OrganisationChooserLight
        width="auto"
        page="leftMenu"
        :defaultanswer="$t('No organisation filter')"
        @selected="onOrganisationSelected"
        :value="organisationId"
        :light="true"
        class="mr-2 hide-top-bar"
        :reset="reset"
        v-if="!isPodcastmaker"
      />
      <hr class="divided-line show-phone" />
      <router-link
        @click="onMenuClick"
        class="text-dark font-weight-bold mb-3 show-phone"
        v-for="category in categories"
        v-bind:key="category.id"
        :to="{
          name: 'category',
          params: { iabId: category.id },
          query: { productor: $store.state.filter.organisationId },
        }"
      >
        {{ category.name }}</router-link
      >
      <div class="d-flex hostedBy">
        <span>{{ $t('Hosted by') }}</span
        ><span class="ml-1 mr-1 primary-color">Saooti</span>
      </div>
    </div>
  </div>
</template>
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
  .default-multiselect-width .basic-select {
    background: #eee !important;
    width: 98%;
  }
}
</style>
<script lang="ts">
import OrganisationChooserLight from '../display/organisation/OrganisationChooserLight.vue';
import { state } from '../../store/paramStore.js';
const octopusApi = require('@saooti/octopus-api');
import store from '@/store/AppStore';
import { defineComponent } from 'vue'
import { LocationQueryValue } from 'vue-router';
export default defineComponent({
  name: 'LeftMenu',

  components: {
    OrganisationChooserLight,
  },

  props: ['displayMenu', 'isEducation'],

  mounted() {
    if (this.filterOrga) {
      this.organisationId = this.filterOrga;
    }
  },

  data() {
    return {
      organisationId: undefined as any,
      reset: false,
    };
  },

  methods: {
    onMenuClick() {
      this.$emit('update:displayMenu', false);
    },
    async onOrganisationSelected(organisation: any) {
      if (organisation && organisation.id) {
        if (this.$route.query.productor !== organisation.id) {
          this.$router.push({ query: { productor: organisation.id } });
        }
        store.commit('filterOrga', {
          orgaId: organisation.id,
          imgUrl: organisation.imageUrl,
        });
        const isLive = await octopusApi.liveEnabledOrganisation(
          organisation.id
        );
        store.commit('filterOrgaLive', isLive);
      } else {
        if (this.$route.query.productor) {
          this.$router.push({ query: { productor: undefined } });
        }
        store.commit('filterOrga', { orgaId: undefined });
      }
    },
  },

  computed: {
    isLiveTab() {
      return state.generalParameters.isLiveTab;
    },
    categories() {
      return state.generalParameters.allCategories.filter((c: { podcastOrganisationCount: any; podcastCount: any; }) => {
        if (this.isPodcastmaker) return c.podcastOrganisationCount;
        return c.podcastCount;
      });
    },
    isPodcastmaker() {
      return state.generalParameters.podcastmaker;
    },
    filterOrga() {
      return store.state.filter.organisationId;
    },
    filterOrgaLive() {
      return store.state.filter.live;
    },
  },

  watch: {
    filterOrga(newVal) {
      if (newVal) {
        this.organisationId = newVal;
      } else {
        this.reset = !this.reset;
      }
    },
  },
});
</script>
