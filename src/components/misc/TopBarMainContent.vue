<template>
  <div class="top-bar-grid" :class="{ scrolled: titleIsDisplayed }">
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
        :src="proxyImageUrl(imgUrl, '', '80')"
        :alt="$t('Visual', { name: filterName })"
        :class="isEducation ? 'educationLogo' : ''"
      />
    </router-link>
    <h1 v-if="titleIsDisplayed" class="text-truncate m-0 align-self-center">
      {{ titleDisplay }}
    </h1>
    <div
      class="d-flex"
      :class="[
        inContentDisplayPage || isPhone
          ? 'flex-row-reverse align-items-center'
          : 'flex-column align-items-end',
      ]"
    >
      <a
        v-if="filterOrgaId && '' == !imgUrl"
        href="https://www.saooti.com/"
        target="_blank"
        rel="noopener"
      >
        <img
          :src="logoUrl"
          :alt="$t('Logo of main page')"
          width="100"
          height="29"
          class="ms-2"
          :class="isEducation ? 'educationLogo' : ''"
        />
      </a>
      <div class="d-flex align-items-center justify-content-end flex-grow-1">
        <template v-for="link in routerLinkArray" :key="link.routeName">
          <router-link
            v-show="!isPhone"
            v-if="link.condition"
            :to="{
              name: link.routeName,
              query: getQueriesRouter(link.routeName),
            }"
            class="link-hover py-2 px-3"
          >
            {{ link.title }}
          </router-link>
        </template>
        <button
          v-show="!isPhone && !inContentDisplayPage"
          id="more-dropdown"
          :title="$t('More')"
          class="d-flex-column flex-nowrap align-items-center btn-transparent py-2 px-3 text-white"
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
            <template
              v-for="link in routerLinkInsideArray"
              :key="link.routeName"
            >
              <router-link
                v-if="link.condition"
                :to="{
                  name: link.routeName,
                  query: getQueriesRouter(link.routeName),
                }"
                class="p-1 octopus-dropdown-item"
              >
                {{ link.title }}
              </router-link>
            </template>
          </div>
        </ClassicPopover>
        <MobileMenu
          :is-education="isEducation"
          :show="mobileMenuDisplay"
          :not-podcast-and-emission="inContentDisplayPage && !scrolled"
          :scrolled="scrolled"
        />
        <HomeDropdown
          :is-education="isEducation"
          :mobile-menu-display="mobileMenuDisplay"
          :scrolled="scrolled"
        />
        <router-link
          v-show="!isPhone && !inContentDisplayPage"
          :title="$t('Search')"
          :to="{
            name: 'podcasts',
            query: { productor: filterOrgaId },
          }"
          class="btn admin-button m-1 saooti-search text-blue-octopus"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { state } from "../../stores/ParamSdkStore";
import HomeDropdown from "./HomeDropdown.vue";
import imageProxy from "../mixins/imageProxy";
import { useFilterStore } from "@/stores/FilterStore";
import { mapState } from "pinia";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import ClassicPopover from "../misc/ClassicPopover.vue";
import { defineComponent, defineAsyncComponent } from "vue";
const MobileMenu = defineAsyncComponent(() => import("./MobileMenu.vue"));
export default defineComponent({
  name: "TopBarMainContent",
  components: {
    HomeDropdown,
    ClassicPopover,
    MobileMenu,
  },
  mixins: [imageProxy],
  props: {
    isEducation: { default: false, type: Boolean },
    isPhone: { default: false, type: Boolean },
    titleDisplay: { default: "", type: String },
    scrolled: { default: false, type: Boolean },
  },
  data() {
    return {};
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
    mobileMenuDisplay(): boolean {
      return this.isPhone || this.inContentDisplayPage;
    },
    titleIsDisplayed(): boolean {
      return this.inContentDisplayPage && this.scrolled && !this.isPhone;
    },
    inContentDisplayPage(): boolean {
      return 0 !== this.titleDisplay.length;
    },
    routerLinkArray() {
      return [
        {
          title: this.$t("Radio & Live"),
          routeName: "lives",
          condition:
            !this.inContentDisplayPage &&
            (state.generalParameters.isLiveTab as boolean) &&
            ((this.filterOrgaId && this.filterLive) || !this.filterOrgaId),
        },
        {
          title: this.$t("Podcasts"),
          routeName: "podcasts",
          condition:
            !this.inContentDisplayPage ||
            (this.inContentDisplayPage && !this.scrolled),
        },
        {
          title: this.$t("Emissions"),
          routeName: "emissions",
          condition:
            !this.inContentDisplayPage ||
            (this.inContentDisplayPage && !this.scrolled),
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
        ? "/img/logo_education_white.svg"
        : "/img/logo_octopus_white2.svg";
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
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  .top-bar-grid {
    display: grid;
    grid-template-columns: 1fr 3fr;
    margin-top: 0.5rem;
    padding: 0 1rem;
    &.scrolled {
      grid-template-columns: 1fr 2fr 1fr;
    }
    @media (max-width: 450px) {
      padding: 0 0.5rem;
    }

    a.link-hover {
      color: white;
      font-weight: bold;
      &.link-hover:hover,
      &.link-hover.router-link-exact-active.router-link-active {
        color: white;
        text-decoration: underline;
        text-underline-offset: 8px;
      }
    }
    .top-bar-logo img {
      max-width: 140px !important;
      max-height: 4rem;
      height: 4rem;
      &.educationLogo {
        height: auto;
      }
      @media (max-width: 650px) {
        height: 2rem;
      }
    }
  }
}
</style>
