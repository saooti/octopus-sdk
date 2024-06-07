<template>
  <div>
    <button
      v-show="show"
      id="mobile-menu-dropdown"
      class="btn-transparent saooti-menu text-white c-hand m-2 h2"
      :title="$t('open left Menu')"
      @click="handleMenuClick"
    />
    <teleport to=".octopus-app" :disabled="scrolled">
      <ClassicPopover
        v-if="firstLoaded"
        target="mobile-menu-dropdown"
        popover-class="popover-z-index"
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
        <a  v-if="!isAuthenticatedWithOrga" class="octopus-dropdown-item" href="/sso/login" realLink="true">
          {{ $t("Login") }}
        </a>
        <a v-else class="octopus-dropdown-item" @click="logoutFunction">
          {{ $t("Logout") }}
        </a>
        <router-link class="octopus-dropdown-item" to="/main/pub/contact">
          {{ $t("Contact") }}
        </router-link>
      </ClassicPopover>
    </teleport>
  </div>
</template>

<script lang="ts">
import crudApi from "@/api/classicCrud";
import { state } from "../../stores/ParamSdkStore";
import orgaFilter from "../mixins/organisationFilter";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { defineComponent, defineAsyncComponent } from "vue";
import { useFilterStore } from "@/stores/FilterStore";
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
    scrolled: { default: false, type: Boolean },
  },
  data() {
    return {
      firstLoaded: false as boolean,
    };
  },
  computed: {
    ...mapState(useFilterStore, [
      "filterLive",
      "filterOrgaId",
      "filterIab",
      "filterRubrique",
    ]),
    isAuthenticatedWithOrga(): boolean {
      return state.generalParameters.authenticated ?? false;
    },
    routerLinkArray() {
      return [
        {
          title: this.$t("My space"),
          routeName: "backoffice",
          condition: this.isAuthenticatedWithOrga,
        },
        { title: this.$t("Home"), routeName: "home", condition: true },
        {
          title: this.$t("Radio & Live"),
          routeName: "lives",
          condition:
            state.generalParameters.isLiveTab &&
            ((this.filterOrgaId && this.filterLive) || !this.filterOrgaId),
        },
        {
          title: this.$t("Podcasts"),
          routeName: "podcasts",
          condition: !this.notPodcastAndEmission,
        },
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
        {
          title: this.$t("Create an account"),
          routeName: "createAccount",
          condition: !this.isAuthenticatedWithOrga,
        },
      ];
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
    async logoutFunction() {
      try {
        await crudApi.postData(4, "/logout", undefined);
        await this.$router.push({ path: "/" });
        location.reload();
      } catch (error) {
        //Do nothing
      }
    },
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
