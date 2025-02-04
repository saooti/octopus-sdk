<template>
  <div class="top-bar-grid" :class="{ scrolled: titleIsDisplayed }">
    <router-link
      class="top-bar-logo d-flex align-items-center"
      :to="{
        name: 'home',
        query: {
          iabId: filterIab?.id,
          rubriquesId: rubriqueQueryParam,
        },
      }"
      :title="$t('Home')"
    >
      <img
        v-if="!filterOrgaId || '' === imgUrl"
        :src="logoUrl"
        role="presentation"
        alt=""
        width="140"
        height="50"
        :class="platformEducation ? 'education-logo' : 'octopus-logo'"
      />
      <img
        v-else
        :src="proxyImageUrl(imgUrl, '', '80')"
        role="presentation"
        alt=""
        class="client-logo"
        :class="platformEducation ? 'education-logo' : ''"
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
      <template v-if="filterOrgaId && '' !== imgUrl">
        <img
          v-if="isGarRole"
          :src="logoUrl"
          role="presentation"
          alt=""
          width="100"
          height="29"
          class="ms-2"
          :class="platformEducation ? 'education-logo' : 'octopus-logo'"
        />
        <a
          v-else
          href="https://www.saooti.com/"
          target="_blank"
          rel="noreferrer noopener"
          :title="$t('New window', {text: 'Saooti'})"
        >
          <img
            :src="logoUrl"
            role="presentation"
            alt=""
            width="100"
            height="29"
            class="ms-2"
            :class="platformEducation ? 'education-logo' : 'octopus-logo'"
          />
        </a>
      </template>
      <div class="d-flex align-items-center justify-content-end flex-grow-1">
        <nav role="navigation" :aria-label="$t('Site menu')">
          <ul class="d-flex">
            <template v-for="link in routerLinkArray" :key="link.routeName">
              <li v-if="link.condition" class="li-style-none">
                <router-link
                  v-show="!isPhone"
                  :to="{
                    name: link.routeName,
                    query: getQueriesRouter(link.routeName),
                  }"
                  class="link-hover py-2 px-3"
                >
                  {{ link.title }}
                </router-link>
              </li>
            </template>
          </ul>
        </nav>
        <button
          v-show="!isPhone && !inContentDisplayPage"
          id="more-dropdown"
          :title="$t('More')"
          class="d-flex-column flex-nowrap align-items-center btn-transparent py-2 px-3 text-white"
        >
          <div class="link-hover">
            {{ $t("More") }}
          </div>
          <ChevronDownIcon />
        </button>
        <ClassicPopover
          target="more-dropdown"
          :only-click="true"
          :is-fixed="true"
          :left-pos="true"
          :is-top-layer="true"
        >
          <nav role="navigation" class="d-flex flex-column" :aria-label="$t('Site menu')">
            <ul class="p-0 m-0">
              <template v-for="link in routerLinkInsideArray" :key="link.routeName">
                <li
                  v-if="link.condition"
                  class="li-style-none"
                >
                  <router-link
                    :to="{
                      name: link.routeName,
                      query: getQueriesRouter(link.routeName),
                    }"
                    class="p-1 octopus-dropdown-item"
                  >
                    {{ link.title }}
                  </router-link>
                </li>
            </template>
            </ul>
          </nav>
        </ClassicPopover>
        <MobileMenu
          :is-education="platformEducation"
          :show="mobileMenuDisplay"
          :not-podcast-and-emission="inContentDisplayPage && !scrolled"
          :scrolled="scrolled"
        />
        <HomeDropdown
          :is-education="platformEducation"
          :mobile-menu-display="mobileMenuDisplay"
          :scrolled="scrolled"
        />
        <router-link
          v-show="!isPhone && !inContentDisplayPage"
          :title="$t('Search')"
          :to="{
            name: 'podcasts',
          }"
          class="btn admin-button m-1 text-blue-octopus"
          role="search"
        >
          <MagnifyIcon :size="30" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import { rubriquesFilterComputed } from "../mixins/routeParam/rubriquesFilterComputed";
import { state } from "../../stores/ParamSdkStore";
import HomeDropdown from "./HomeDropdown.vue";
import imageProxy from "../mixins/imageProxy";
import { useFilterStore } from "../../stores/FilterStore";
import { useAuthStore } from "../../stores/AuthStore";
import { mapState } from "pinia";
import ClassicPopover from "../misc/ClassicPopover.vue";
import { defineComponent, defineAsyncComponent } from "vue";
import { useGeneralStore } from "../../stores/GeneralStore";
const MobileMenu = defineAsyncComponent(() => import("./MobileMenu.vue"));
export default defineComponent({
  name: "TopBarMainContent",
  components: {
    HomeDropdown,
    ClassicPopover,
    MobileMenu,
    MagnifyIcon,
    ChevronDownIcon,
  },
  mixins: [imageProxy, rubriquesFilterComputed],
  props: {
    isPhone: { default: false, type: Boolean },
    titleDisplay: { default: "", type: String },
    scrolled: { default: false, type: Boolean },
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(useGeneralStore, ["platformEducation"]),
    ...mapState(useFilterStore, [
      "filterLive",
      "filterOrgaId",
      "filterImgUrl",
      "filterIab",
      "filterName",
    ]),
    ...mapState(useAuthStore, ["isGarRole"]),
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
            !this.isPodcastmaker && (!this.filterOrgaId || this.platformEducation),
        },
      ];
    },
    logoUrl(): string {
      if (this.platformEducation) {
        return "/img/logo_education_white.svg";
      }
      return this.isPhone
        ? "/img/logo_octopus_bubble.svg"
        : "/img/logo_saooti_play_white.svg";
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


.octopus-app {
  .top-bar-grid {
    display: grid;
    grid-template-columns: 1fr 5fr;
    margin-top: 0.5rem;
    padding: 0 1rem;

    &.scrolled {
      grid-template-columns: 1fr 2fr 1fr;
    }

    @media (width <= 450px) {
      padding: 0 0.5rem;
    }

    .link-hover {
      color: white;
      font-weight: bold;
      font-size: 0.93rem;

      &.link-hover:hover,
      &.link-hover.router-link-exact-active.router-link-active {
        color: white;
        text-decoration: underline;
        text-underline-offset: 8px;
      }
    }

    .client-logo {
      border-radius: var(--octopus-border-radius);
    }

    .top-bar-logo img {
      max-width: 140px !important;
      max-height: 4rem;
      height: 4rem;

      &.education-logo {
        height: auto;
      }

      @media (width <= 650px) {
        max-height: 2rem;
      }
    }

    .octopus-logo {
      @media (width <= 960px) {
        max-width: 30px !important;
      }
    }
  }
}
</style>
