<template>
  <div class="d-flex align-items-center">
    <router-link
      v-if="isAuthenticatedWithOrga"
      :title="$t('My space')"
      to="/main/priv/backoffice"
      class="btn admin-button hide-smallest-screen m-1 saooti-admin-menu"
    />
    <router-link
      v-if="isAuthenticatedWithOrga && isContribution"
      :title="$t('Upload')"
      to="/main/priv/upload"
      class="btn admin-button hide-smallest-screen m-1 saooti-upload"
    />
    <button
      id="home-dropdown"
      class="btn m-1 admin-button saooti-user"
      :title="$t('User menu')"
    />
    <ClassicPopover
      target="home-dropdown"
      :only-click="true"
      :is-fixed="true"
      :left-pos="true"
    >
      <template v-if="!isAuthenticated">
        <a class="octopus-dropdown-item" href="/sso/login" realLink="true">
          {{ $t("Login") }}
        </a>
        <router-link
          v-if="!isPodcastmaker"
          class="octopus-dropdown-item"
          to="/main/pub/create"
        >
          {{ $t("Create an account") }}
        </router-link>
      </template>
      <template v-else>
        <template v-for="routerBack in routerBackoffice" :key="routerBack.path">
          <router-link
            v-if="!isPodcastmaker && routerBack.condition"
            :class="routerBack.class"
            :to="routerBack.path"
          >
            {{ routerBack.title }}
          </router-link>
        </template>
        <template v-if="helpLinks.length">
          <hr />
          <template v-for="helpLink in helpLinks" :key="helpLink.title">
            <a
              :href="helpLink.href"
              class="octopus-dropdown-item"
              rel="noopener"
              target="_blank"
              realLink="true"
            >
              {{ helpLink.title }}
            </a>
          </template>
        </template>
        <hr />
        <a class="octopus-dropdown-item" href="/logout" realLink="true">
          {{ $t("Logout") }}
        </a>
      </template>
      <router-link class="octopus-dropdown-item" to="/main/pub/contact">
        {{ $t("Contact") }}
      </router-link>
    </ClassicPopover>
  </div>
</template>

<script lang="ts">
import { state } from "../../stores/ParamSdkStore";
import ClassicPopover from "../misc/ClassicPopover.vue";
import { useAuthStore } from "@/stores/AuthStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { Organisation } from "@/stores/class/general/organisation";
export default defineComponent({
  name: "HomeDropdown",
  components: {
    ClassicPopover,
  },
  props: {
    isEducation: { default: false, type: Boolean },
  },
  computed: {
    ...mapState(useAuthStore, ["authProfile", "isGarRole"]),
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
          condition: this.isAuthenticatedWithOrga && this.isContribution,
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
            ((state.generalParameters.isOrganisation as boolean) ||
              1 < this.organisationsAvailable.length),
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
      return state.generalParameters.authenticated ?? false;
    },
    isContribution(): boolean {
      return state.generalParameters.isContribution ?? false;
    },
  },
});
</script>
