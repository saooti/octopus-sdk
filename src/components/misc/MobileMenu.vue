<template>
  <div>
    <button
      v-show="show"
      id="mobile-menu-dropdown"
      class="btn-transparent saooti-menu text-white c-hand m-2 h2"
      :title="$t('open left Menu')"
      @click="handleMenuClick"
    />
    <ClassicPopover
      v-if="firstLoaded"
      target="mobile-menu-dropdown"
      :only-click="true"
      :is-fixed="true"
      :left-pos="true"
    >
      <template v-for="link in routerLinkArray" :key="link.routeName">
        <router-link
          v-if="link.condition"
          :class="
            'home' === link.routeName
              ? 'octopus-dropdown-item show-phone-flex'
              : 'octopus-dropdown-item'
          "
          :to="{
            name: link.routeName,
            query: getQueriesRouter(link.routeName),
          }"
        >
          {{ link.title }}
        </router-link>
      </template>
      <hr class="show-phone" />
      <router-link
        v-for="category in categories"
        :key="category.id"
        class="show-phone-flex octopus-dropdown-item"
        :to="{
          name: 'category',
          params: { iabId: category.id },
          query: { productor: filterOrgaId },
        }"
      >
        {{ category.name }}
      </router-link>
    </ClassicPopover>
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
const ClassicPopover = defineAsyncComponent(
  () => import("../misc/ClassicPopover.vue"),
);
export default defineComponent({
  name: "MobileMenu",
  components: {
    ClassicPopover,
  },
  mixins: [orgaFilter],
  props: {
    isEducation: { default: false, type: Boolean },
    show: { default: false, type: Boolean },
    notPodcastAndEmission: { default: false, type: Boolean },
  },
  data() {
    return {
      firstLoaded: false as boolean,
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
        { title: this.$t("Podcasts"), routeName: "podcasts", condition: !this.notPodcastAndEmission },
        {
          title: this.$t("Emissions"),
          routeName: "emissions",
          condition: !this.notPodcastAndEmission,
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

  methods: {
    handleMenuClick() {
      if (this.firstLoaded) {
        return;
      }
      this.firstLoaded = true;
      setTimeout(() => {
        document.getElementById("mobile-menu-dropdown")?.click();
      }, 200);
    },
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
  },
});
</script>
