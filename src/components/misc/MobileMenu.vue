<template>
  <div>
    <button
      id="mobile-menu-dropdown"
      class="btn-transparent saooti-menu"
      :title="$t('open left Menu')"
    />
    <ClassicPopover
      target="mobile-menu-dropdown"
      :only-click="true"
      :is-fixed="true"
      :left-pos="true"
    >
      <template v-for="link in routerLinkArray" :key="link.routeName">
        <router-link
          v-if="link.condition"
          :class="'home' === link.routeName ? 'octopus-dropdown-item show-phone-flex' : 'octopus-dropdown-item'"
          :to="{
            name: link.routeName,
            query: getQueriesRouter(link.routeName),
          }"
        >
          {{ link.title }}
        </router-link>
      </template>
      <OrganisationChooserLight
        v-if="!isPodcastmaker && organisationId"
        width="auto"
        class="octopus-dropdown-item"
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
import { Organisation } from "@/stores/class/general/organisation";
const OrganisationChooserLight = defineAsyncComponent(
  () => import("../display/organisation/OrganisationChooserLight.vue"),
);
import ClassicPopover from "../misc/ClassicPopover.vue";
export default defineComponent({
  name: "MobileMenu",
  components: {
    OrganisationChooserLight,
    ClassicPopover
  },
  mixins: [orgaFilter],
  props: {
    isEducation: { default: false, type: Boolean },
  },
  data() {
    return {
      organisationId: undefined as string | undefined,
      reset: false as boolean,
    };
  },
  computed:{
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
