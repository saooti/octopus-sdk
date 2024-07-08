<template>
  <div class="d-flex flex-column h-100 octopus-app">
    <template v-if="pageFullyLoad">
      <TopBar :is-education="false" />
      <CategoryFilter v-if="firstDisplayCategoryFilter" />
      <div v-else class="category-filter-no-filter" />
      <router-view />
      <ClassicLazy :min-height="123">
        <FooterOctopus />
      </ClassicLazy>
      <PlayerComponent />
    </template>
  </div>
</template>

<script lang="ts">
import TopBar from "@/components/misc/TopBar.vue";
import PlayerComponent from "@/components/misc/player/PlayerComponent.vue";
import ClassicLazy from "@/components/misc/ClassicLazy.vue";
import { state } from "./stores/ParamSdkStore";
import { Rubriquage } from "./stores/class/rubrique/rubriquage";
import { RubriquageFilter } from "./stores/class/rubrique/rubriquageFilter";
import { Rubrique } from "./stores/class/rubrique/rubrique";
import initSDK from "./components/mixins/init";
import { useFilterStore } from "@/stores/FilterStore";
import { useGeneralStore } from "@/stores/GeneralStore";
import { mapState, mapActions } from "pinia";
import { defineAsyncComponent, defineComponent } from "vue";
import { Category } from "./stores/class/general/category";
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

  mixins: [initSDK],

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
  },

  watch: {
    $route: {
      deep: true,
      immediate: true,
      async handler() {
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
    ...mapActions(useFilterStore, ["filterUpdateIab", "filterUpdateRubrique"]),
    async initApp() {
      await this.initSdk();
      await this.handleOrganisationFilter();
      this.handleIabIdFilter();
      this.handleRubriquesFilter();
    },
    async handleOrganisationFilter() {
      let orgaId = "";
      if (
        this.$route.query.productor &&
        "string" === typeof this.$route.query.productor
      ) {
        orgaId = this.$route.query.productor;
      } else if (state.generalParameters.organisationId) {
        orgaId = state.generalParameters.organisationId;
      }
      if ("" === orgaId) {
        return;
      }
      await this.selectOrganisation(orgaId);
    },
    handleIabIdFilter() {
      if (this.filterOrgaId) {
        return;
      }
      if (
        this.$route.query.iabId &&
        "string" === typeof this.$route.query.iabId
      ) {
        const iabId = parseInt(this.$route.query.iabId, 10);
        const category = this.storedCategories.filter((c: Category) => {
          return c.id === iabId;
        });
        if (category.length) {
          this.filterUpdateIab(category[0]);
        }
      }
    },
    handleRubriquesFilter() {
      if (0 === this.filterRubriquage.length) {
        return;
      }
      if (
        this.$route.query.rubriquesId &&
        "string" === typeof this.$route.query.rubriquesId
      ) {
        const arrayFilter = this.$route.query.rubriquesId.split(",");
        const rubriquesFilter: Array<RubriquageFilter> = [];
        const filterLength = arrayFilter.length;
        for (let index = 0; index < filterLength; index++) {
          const rubriqueFilter = arrayFilter[index].split(":");
          const rubriquage = this.filterRubriquage.find((x: Rubriquage) => {
            return x.rubriquageId === parseInt(rubriqueFilter[0]);
          });
          if (rubriquage) {
            const rubrique = rubriquage.rubriques.find((x: Rubrique) => {
              return x.rubriqueId === parseInt(rubriqueFilter[1]);
            });
            rubriquesFilter.push({
              rubriquageId: rubriquage.rubriquageId,
              rubriqueId: rubrique.rubriqueId,
              nameRubriquage: rubriquage.title,
              nameRubrique: rubrique.name,
            });
          }
        }
        if (rubriquesFilter.length) {
          this.filterUpdateRubrique(rubriquesFilter);
        }
      }
    },
  },
});
</script>

<style lang="scss" src="@/assets/octopus-library.scss"></style>
