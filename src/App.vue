<template>
  <div class="d-flex flex-column h-100 octopus-app">
    <template v-if="pageFullyLoad">
      <TopBar :is-education="false" />
      <main>
        <CategoryFilter v-if="firstDisplayCategoryFilter" />
        <div v-else class="category-filter-no-filter" />
        <router-view />
        <PlayerComponent />
      </main>
      <ClassicLazy :min-height="123">
        <FooterOctopus />
      </ClassicLazy>
    </template>
  </div>
</template>
<script lang="ts">
import TopBar from "@/components/misc/TopBar.vue";
import PlayerComponent from "@/components/misc/player/PlayerComponent.vue";
import ClassicLazy from "@/components/misc/ClassicLazy.vue";
import initSDK from "./components/mixins/init";
import metaTitle from "./components/mixins/metaTitle";
import { useAuthStore } from "./stores/AuthStore";
import { useFilterStore } from "./stores/FilterStore";
import { useGeneralStore } from "./stores/GeneralStore";
import { mapState, mapActions } from "pinia";
import { defineAsyncComponent, defineComponent } from "vue";
const FooterOctopus = defineAsyncComponent(
  () => import("@/components/misc/FooterSection.vue"),
);
const CategoryFilter = defineAsyncComponent(
  () => import("@/components/display/categories/CategoryFilter.vue"),
);
export default defineComponent({
  name: "App",

  components: {
    TopBar,
    CategoryFilter,
    FooterOctopus,
    PlayerComponent,
    ClassicLazy,
  },

  mixins: [initSDK, metaTitle],

  data() {
    return {
      reload: false as boolean,
      pageFullyLoad: false as boolean,
      firstDisplayCategoryFilter: false as boolean,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterRubriquage", "filterOrgaId"]),
    ...mapState(useGeneralStore, ["storedCategories"]),
    ...mapState(useAuthStore, ["authOrgaId"]),
  },

  watch: {
    $route: {
      immediate: true,
      async handler() {
        this.updateMetaTitle();
        if (this.firstDisplayCategoryFilter) {
          return;
        }
        const namesRouteWithCategoryFilter = [
          "homePriv",
          "home",
          "podcasts",
          "emissions",
          "participants",
          "playlists",
        ];
        this.firstDisplayCategoryFilter = namesRouteWithCategoryFilter.includes(
          this.$route.name?.toString() ?? "",
        );
      },
    },
    "$i18n.locale"() {
      this.updateMetaTitle();
      this.$forceUpdate();
      this.reload = !this.reload;
    },
  },
  created() {
    this.initApp();
    setTimeout(() => {
      this.pageFullyLoad = true;
    }, 2000);
  },
  methods: {
    ...mapActions(useFilterStore, ["filterUpdateRubrique"]),
    async initApp() {
      await this.initSdk();
      await this.handleOrganisationFilter();
    },
    async handleOrganisationFilter() {
      let orgaId = "";
      if (
        this.$route.query.productor &&
        "string" === typeof this.$route.query.productor
      ) {
        orgaId = this.$route.query.productor;
      } else if (this.authOrgaId) {
        orgaId = this.authOrgaId;
      }
      if ("" === orgaId) {
        return;
      }
      await this.selectOrganisation(orgaId);
    },
  },
});
</script>

<style lang="scss" src="@/assets/octopus-library.scss"></style>
