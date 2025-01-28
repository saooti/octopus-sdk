<template>
  <div class="d-flex align-items-center">
    <button
      v-if="isAuthenticatedWithOrga"
      :title="$t('My space')"
      class="btn admin-button hide-small-screen m-1 text-blue-octopus"
      @click="goToAdministration"
    >
      <AppsIcon :size="30" />
    </button>
    <router-link
      v-if="isAuthenticatedWithOrga && isRoleContribution"
      :title="$t('Upload')"
      to="/main/priv/upload"
      class="btn admin-button hide-small-screen m-1 text-blue-octopus"
    >
      <DownloadIcon :size="30" />
    </router-link>
    <button
      v-show="!mobileMenuDisplay || isAuthenticatedWithOrga"
      id="home-dropdown"
      class="btn m-1 admin-button hide-small-screen text-blue-octopus"
      :title="$t('User menu')"
    >
      <AccountIcon :size="30" />
    </button>
    <ClassicPopover
      target="home-dropdown"
      popover-class="popover-z-index"
      :only-click="true"
      :is-fixed="true"
      :left-pos="true"
      :is-top-layer="true"
    >
      <nav :aria-label="$t('User menu')">
        <ul class="p-0 m-0">
          <template v-if="!isAuthenticated">
            <li class="li-style-none">
              <a class="octopus-dropdown-item" href="/sso/login" realLink="true">
                {{ $t("Login") }}
              </a>
            </li>
            <li class="li-style-none">
              <router-link
                v-if="!isPodcastmaker"
                class="octopus-dropdown-item"
                to="/main/pub/create"
              >
                {{ $t("Create an account") }}
              </router-link>
            </li>
          </template>
          <template v-else>
            <li v-for="routerBack in routerBackoffice" :key="routerBack.path" class="li-style-none">
              <router-link
                v-if="!isPodcastmaker && routerBack.condition"
                :class="routerBack.class"
                :to="routerBack.path"
              >
                {{ routerBack.title }}
              </router-link>
            </li>
            <template v-if="helpLinks.length">
              <hr />
              <li v-for="helpLink in helpLinks" :key="helpLink.title" class="li-style-none">
                <a
                  :href="helpLink.href"
                  class="octopus-dropdown-item"
                  rel="noreferrer noopener"
                  target="_blank"
                  realLink="true"
                  :title="$t('New window', {text: helpLink.title})"
                >
                  {{ helpLink.title }}
                  <OpenInNewIcon class="ms-1" :size="15"/>
                </a>
              </li>
            </template>
            <hr />
            <li class="li-style-none">
              <a class="octopus-dropdown-item c-hand" href="/logout">
                {{ $t("Logout") }}
              </a>
            </li>
          </template>
          <li class="li-style-none">
            <router-link
              v-if="!isGarRole"
              class="octopus-dropdown-item"
              to="/main/pub/contact"
            >
              {{ $t("Contact") }}
            </router-link>
          </li>
        </ul>
      </nav>
    </ClassicPopover>
  </div>
</template>

<script lang="ts">
import OpenInNewIcon from "vue-material-design-icons/OpenInNew.vue";
import AppsIcon from "vue-material-design-icons/Apps.vue";
import AccountIcon from "vue-material-design-icons/Account.vue";
import DownloadIcon from "vue-material-design-icons/Download.vue";
import { state } from "../../stores/ParamSdkStore";
import ClassicPopover from "../misc/ClassicPopover.vue";
import { useAuthStore } from "../../stores/AuthStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { Organisation } from "@/stores/class/general/organisation";
export default defineComponent({
  name: "HomeDropdown",
  components: {
    ClassicPopover,
    DownloadIcon,
    AccountIcon,
    AppsIcon,
    OpenInNewIcon
  },
  props: {
    isEducation: { default: false, type: Boolean },
    mobileMenuDisplay: { default: false, type: Boolean },
    scrolled: { default: false, type: Boolean },
  },
  computed: {
    ...mapState(useAuthStore, [
      "authOrgaId",
      "authProfile",
      "isGarRole",
      "isRoleContribution",
      "isRoleOrganisation",
    ]),
    organisationsAvailable(): Array<Organisation> {
      return this.authProfile.organisations ?? [];
    },
    helpLinks() {
      if (this.isGarRole || this.isEducation) {
        return [];
      }
      return [
        {
          title: this.$t("Help"),
          href: "https://help.octopus.saooti.com/Aide/",
        },
        { title: this.$t("TutoMag"), href: "https://help.octopus.saooti.com/" },
      ];
    },
    routerBackoffice() {
      return [
        {
          title: this.$t("My space"),
          class: "octopus-dropdown-item show-small-phone-flex",
          path: "/main/priv/backoffice",
          condition: this.isAuthenticatedWithOrga,
        },
        {
          title: this.$t("Upload"),
          class: "octopus-dropdown-item show-small-phone-flex",
          path: "/main/priv/upload",
          condition: this.isAuthenticatedWithOrga && this.isRoleContribution,
        },
        {
          title: this.$t("Edit my profile"),
          class: "octopus-dropdown-item",
          path: "/main/priv/edit/profile",
          condition: true,
        },
        {
          title: this.$t("Edit my organisation"),
          class: "octopus-dropdown-item",
          path: "/main/priv/edit/organisation",
          condition:
            this.isAuthenticatedWithOrga &&
            (this.isRoleOrganisation || 1 < this.organisationsAvailable.length),
        },
      ];
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    isAuthenticated(): boolean {
      return undefined !== this.authProfile?.userId;
    },
    isAuthenticatedWithOrga(): boolean {
      return undefined !== this.authOrgaId;
    },
  },
  methods: {
    goToAdministration() {
      if ("backoffice" !== this.$route.name) {
        this.$router.push("/main/priv/backoffice");
      } else if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push("/");
      }
    },
  },
});
</script>
