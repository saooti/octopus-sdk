<template>
  <div class="top-bar-container" :class="{ scrolled: scrolled }">
    <router-link
      class="top-bar-logo"
      :to="{
        name: 'home',
        query: {
          productor: filterOrgaId,
          iabId: filterIab?.id,
          rubriquesId: rubriqueQueryParam,
        },
      }"
    >
      <img
        v-if="!filterOrgaId || '' === imgUrl"
        :src="logoUrl"
        :alt="$t('Logo of main page')"
        width="140"
        height="50"
        :class="isEducation ? 'educationLogo' : ''"
      />
      <img
        v-else
        :src="proxyImageUrl(imgUrl, '', '50')"
        :alt="$t('Visual', { name: filterName })"
        :class="isEducation ? 'educationLogo' : ''"
      />
    </router-link>
    <OrganisationChooserLight
      v-if="!isPodcastmaker && organisationId && !isPhone"
      page="topBar"
      width="auto"
      :defaultanswer="$t('No organisation filter')"
      :value="organisationId"
      class="ms-3 me-2"
      :reset="reset"
      @selected="onOrganisationSelected"
    />
    <div class="d-flex align-items-center justify-content-end flex-grow-1">
      <template v-for="link in routerLinkArray" :key="link.routeName">
        <router-link
          v-if="link.condition"
          :to="{
            name: link.routeName,
            query: getQueriesRouter(link.routeName),
          }"
          class="link-hover p-3"
        >
          {{ link.title }}
        </router-link>
      </template>
      <button
        v-if="!isPhone"
        id="more-dropdown"
        :title="$t('More')"
        class="d-flex align-items-center btn-transparent p-3"
      >
        <div class="link-hover">
          {{ $t("More") }}
        </div>
        <div class="ms-1 saooti-down" />
      </button>
      <ClassicPopover
        target="more-dropdown"
        :only-click="true"
        :is-fixed="true"
        :left-pos="true"
      >
        <div class="d-flex flex-column">
          <template v-for="link in routerLinkInsideArray" :key="link.routeName">
            <router-link
              v-if="link.condition"
              :to="{
                name: link.routeName,
                query: getQueriesRouter(link.routeName),
              }"
              class="link-hover p-1 octopus-dropdown-item"
            >
              {{ link.title }}
            </router-link>
          </template>
        </div>
      </ClassicPopover>
    </div>
    <MobileMenu :is-education="isEducation" />

    <div class="d-flex flex-column">
      <div class="d-flex justify-content-end flex-nowrap">
        <HomeDropdown :is-education="isEducation" />
        <router-link
          :title="$t('Search')"
          :to="{
            name: 'podcasts',
            query: { productor: filterOrgaId },
          }"
          class="btn admin-button m-1 saooti-search"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { isServer, onClient } from "../../helper/environment";
import { state } from "../../stores/ParamSdkStore";
import HomeDropdown from "./HomeDropdown.vue";
import { Organisation } from "@/stores/class/general/organisation";
import orgaFilter from "../mixins/organisationFilter";
import imageProxy from "../mixins/imageProxy";
import { useFilterStore } from "@/stores/FilterStore";
import { mapState } from "pinia";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import ClassicPopover from "../misc/ClassicPopover.vue";
import resizePhone from "../mixins/resizePhone";
import { defineComponent, defineAsyncComponent } from "vue";
const OrganisationChooserLight = defineAsyncComponent(
  () => import("../display/organisation/OrganisationChooserLight.vue"),
);
const MobileMenu = defineAsyncComponent(() => import("./MobileMenu.vue"));
export default defineComponent({
  name: "TopBar",
  components: {
    OrganisationChooserLight,
    HomeDropdown,
    ClassicPopover,
    MobileMenu,
  },
  mixins: [orgaFilter, imageProxy, resizePhone],
  props: {
    isEducation: { default: false, type: Boolean },
  },
  data() {
    return {
      scrolled: false as boolean,
      oldScrollY: 0 as number,
      minScroll: 0 as number,
      organisationId: undefined as string | undefined,
      reset: false as boolean,
      isPhone: false as boolean,
      windowWidth: 0 as number,
    };
  },
  computed: {
    ...mapState(useFilterStore, [
      "filterLive",
      "filterOrgaId",
      "filterImgUrl",
      "filterIab",
      "filterRubrique",
      "filterName",
    ]),
    routerLinkArray() {
      return [
        {
          title: this.$t("Radio & Live"),
          routeName: "lives",
          condition:
            (state.generalParameters.isLiveTab as boolean) &&
            ((this.filterOrgaId && this.filterLive) || !this.filterOrgaId),
        },
        { title: this.$t("Podcasts"), routeName: "podcasts", condition: true },
        {
          title: this.$t("Emissions"),
          routeName: "emissions",
          condition: true,
        },
      ];
    },
    routerLinkInsideArray() {
      return [
        {
          title: this.$t("Speakers"),
          routeName: "participants",
          condition: true,
        },
        {
          title: this.$t("Playlists"),
          routeName: "playlists",
          condition: true,
        },
        {
          title: this.$t("Productors"),
          routeName: "productors",
          condition:
            !this.isPodcastmaker && (!this.filterOrgaId || this.isEducation),
        },
      ];
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
    logoUrl(): string {
      return this.isEducation
        ? "/img/logo_education.webp"
        : "/img/logo_octopus_final.svg";
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    imgUrl(): string {
      if (!this.filterImgUrl?.includes("emptypodcast"))
        return `${this.filterImgUrl}`;
      return "";
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
  mounted() {
    onClient(() => {
      window.addEventListener("scroll", this.handleScroll);
    });
  },
  beforeUnmount() {
    onClient(() => {
      window.removeEventListener("scroll", this.handleScroll);
    });
  },
  methods: {
    getQueriesRouter(routeName: string) {
      if ("podcasts" !== routeName && "emissions" !== routeName) {
        return { productor: this.filterOrgaId };
      }
      return {
        productor: this.filterOrgaId,
        iabId: this.filterIab?.id,
        rubriquesId: this.rubriqueQueryParam,
      };
    },
    handleScroll(): void {
      if (isServer) {
        return;
      }
      const scrollY = window.scrollY;
      if (
        scrollY - this.oldScrollY > 0 &&
        scrollY > 1 &&
        document.body.offsetHeight - window.innerHeight > 40
      ) {
        this.scrolled = true;
        this.minScroll = 0;
      } else if (
        scrollY - this.oldScrollY < 0 &&
        scrollY < 1 &&
        this.minScroll > 20
      ) {
        this.scrolled = false;
        this.minScroll = 0;
      }
      this.oldScrollY = scrollY;
      if (this.minScroll < scrollY) {
        this.minScroll = scrollY;
      }
    },
    async onOrganisationSelected(
      organisation: Organisation | undefined,
    ): Promise<void> {
      if (organisation?.id) {
        await this.selectOrganisation(organisation.id);
        return;
      }
      this.organisationId = undefined;
      this.removeSelectedOrga();
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  .top-bar-container {
    position: sticky;
    top: 0;
    background: #fff;
    width: 100%;
    height: 3.5rem;
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
      font-size: 1.5rem;
      margin: 0.5rem;
    }

    .top-bar-logo img {
      max-width: 140px !important;
      max-height: 2.5rem;
      height: 2.5rem;
      &.educationLogo {
        height: auto;
      }
      @media (max-width: 650px) {
        height: 2rem;
      }
    }
    &.scrolled {
      .link-hover,
      .saooti-down {
        display: none;
      }
      .saooti-menu {
        display: block;
      }
    }
    /** PHONES*/
    @media (max-width: 960px) {
      .link-hover {
        display: none;
      }
      .saooti-menu {
        display: block;
      }
    }
  }
}
</style>
