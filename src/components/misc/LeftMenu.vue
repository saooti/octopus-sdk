<template>
  <div class="left-menu-container" @mouseleave="onMenuClick">
    <template v-for="link in routerLinkArray" :key="link.routeName">
      <router-link
        v-if="link.condition"
        :class="'home' === link.routeName ? 'show-phone' : ''"
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
      v-if="!isPodcastmaker && organisationId"
      width="auto"
      page="leftMenu"
      :defaultanswer="$t('No organisation filter')"
      :value="organisationId"
      :reset="reset"
      @selected="onOrganisationSelected"
    />
    <hr class="show-phone" />
    <router-link
      v-for="category in categories"
      :key="category.id"
      class="show-phone"
      :to="{
        name: 'category',
        params: { iabId: category.id },
        query: { productor: filterOrgaId },
      }"
      @click="onMenuClick"
    >
      {{ category.name }}
    </router-link>
  </div>
</template>

<script lang="ts">
import { state } from "../../stores/ParamSdkStore";
import orgaFilter from "../mixins/organisationFilter";
import { Category } from "@/stores/class/general/category";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { defineComponent, defineAsyncComponent } from "vue";
import { useFilterStore } from "@/stores/FilterStore";
import { useGeneralStore } from "@/stores/GeneralStore";
import { mapState } from "pinia";
import { Organisation } from "@/stores/class/general/organisation";
const OrganisationChooserLight = defineAsyncComponent(
  () => import("../display/organisation/OrganisationChooserLight.vue"),
);
export default defineComponent({
  name: "LeftMenu",
  components: {
    OrganisationChooserLight,
  },
  mixins: [orgaFilter],
  props: {
    isEducation: { default: false, type: Boolean },
  },
  emits: ["close"],
  data() {
    return {
      organisationId: undefined as string | undefined,
      reset: false as boolean,
    };
  },
  computed: {
    ...mapState(useGeneralStore, ["storedCategories"]),
    ...mapState(useFilterStore, [
      "filterLive",
      "filterOrgaId",
      "filterIab",
      "filterRubrique",
    ]),
    routerLinkArray() {
      return [
        { title: this.$t("Home"), routeName: "home", condition: true },
        {
          title: this.$t("Radio & Live"),
          routeName: "lives",
          condition:
            state.generalParameters.isLiveTab &&
            ((this.filterOrgaId && this.filterLive) || !this.filterOrgaId),
        },
        { title: this.$t("Podcasts"), routeName: "podcasts", condition: true },
        {
          title: this.$t("Emissions"),
          routeName: "emissions",
          condition: true,
        },
        {
          title: this.$t("Productors"),
          routeName: "productors",
          condition:
            !this.isPodcastmaker && (!this.filterOrgaId || this.isEducation),
        },
        {
          title: this.$t("Playlists"),
          routeName: "playlists",
          condition: true,
        },
        {
          title: this.$t("Speakers"),
          routeName: "participants",
          condition: true,
        },
      ];
    },
    categories(): Array<Category> {
      return this.storedCategories.filter((c: Category) => {
        if (this.isPodcastmaker) return c.podcastOrganisationCount;
        return c.podcastCount;
      });
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    rubriqueQueryParam(): string | undefined {
      if (this.filterRubrique?.length) {
        return this.filterRubrique
          .map(
            (value: RubriquageFilter) =>
              value.rubriquageId + ":" + value.rubriqueId,
          )
          .join();
      }
      return undefined;
    },
  },
  watch: {
    filterOrgaId: {
      immediate: true,
      handler() {
        if (this.filterOrgaId) {
          this.organisationId = this.filterOrgaId;
        } else {
          this.reset = !this.reset;
        }
      },
    },
  },

  methods: {
    getQueriesRouter(routeName: string) {
      if (
        "podcasts" !== routeName &&
        "emissions" !== routeName &&
        "home" !== routeName
      ) {
        return { productor: this.filterOrgaId };
      }
      return {
        productor: this.filterOrgaId,
        iabId: this.filterIab?.id,
        rubriquesId: this.rubriqueQueryParam,
      };
    },
    onMenuClick() {
      this.$emit("close");
    },
    async onOrganisationSelected(organisation: Organisation | undefined) {
      if (organisation?.id) {
        await this.selectOrganisation(organisation.id);
        return;
      }
      this.removeSelectedOrga();
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
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

    a {
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
