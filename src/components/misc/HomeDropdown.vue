<template>
  <div class="d-flex align-items-center">
    <button
      v-if="isAuthenticatedWithOrga"
      :title="$t('My space')"
      class="btn admin-button hide-small-screen m-1 saooti-admin-menu text-blue-octopus"
      @click="goToAdministration"
    />
    <router-link
      v-if="isAuthenticatedWithOrga && isContribution"
      :title="$t('Upload')"
      to="/main/priv/upload"
      class="btn admin-button hide-small-screen m-1 saooti-download text-blue-octopus"
    />
    <button
      v-show="!mobileMenuDisplay || isAuthenticatedWithOrga"
      id="home-dropdown"
      class="btn m-1 admin-button hide-small-screen saooti-user text-blue-octopus"
      :title="$t('User menu')"
    />
    <teleport to=".octopus-app" :disabled="scrolled">
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
          <template
            v-for="routerBack in routerBackoffice"
            :key="routerBack.path"
          >
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
          <a class="octopus-dropdown-item c-hand" @click="logoutFunction">
            {{ $t("Logout") }}
          </a>
        </template>
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
    mobileMenuDisplay: { default: false, type: Boolean },
    scrolled: { default: false, type: Boolean },
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
