<template>
  <div
    class="top-bar-dropdown"
  >
    <div
      v-if="authenticated"
      class="dropdown split-dropdown btn-group"
    >
      <button
        class="btn btn-primary main-button-dropdown"
        @click="goToUrl('/main/priv/backoffice')"
      >
        {{ $t('My space') }}
      </button>
      <button
        class="btn dropdown-toggle btn-primary data-selenium-dropdown-topbar dropdown-toggle-split"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      />
      <div class="dropdown-menu dropdown-menu-right px-4">
        <router-link
          v-if="isContribution && !isPodcastmaker"
          class="btn btn-primary w-100"
          to="/main/priv/upload"
        >
          {{ $t('Upload') }}
        </router-link>
        <template v-if="!isPodcastmaker">
          <router-link
            to="/main/priv/backoffice"
            class="show-phone dropdown-item"
          >
            {{ $t('My space') }}
          </router-link>
          <router-link
            class="dropdown-item"
            to="/main/priv/edit/profile"
          >
            {{ $t('Edit my profile') }}
          </router-link>
          <router-link
            v-if="isOrganisation"
            class="dropdown-item"
            to="/main/priv/edit/organisation"
          >
            {{ $t('Edit my organisation') }}
          </router-link>
        </template>
        <template v-if="!isEducation">
          <hr class="dropdown-divider">
          <a
            href="https://help.octopus.saooti.com/Aide/"
            class="dropdown-item"
            rel="noopener"
            target="_blank"
          >
            {{ $t('Help') }}
          </a>
          <a
            href="https://help.octopus.saooti.com/"
            class="dropdown-item"
            rel="noopener"
            target="_blank"
          >
            {{ $t('TutoMag') }}
          </a>
          <hr class="dropdown-divider">
          <a
            class="dropdown-item"
            href="/sso/logout"
          >
            {{ $t('Logout') }}
          </a>
        </template>
      </div>
    </div>
    <div
      v-else
      class="dropdown btn-group"
    >
      <button
        class="btn dropdown-toggle m-1 admin-button dropdown-toggle-no-caret saooti-user-octopus"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Profile"
      />
      <div class="dropdown-menu dropdown-menu-right px-4">
        <a
          class="dropdown-item"
          href="/sso/login"
        >
          {{ $t('Login') }}
        </a>
        <router-link
          v-if="!isPodcastmaker"
          class="dropdown-item"
          to="/main/pub/create"
        >
          {{ $t('Create an account') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { state } from '../../store/paramStore';

import { defineComponent } from 'vue'
export default defineComponent({
  name: 'HomeDropdown',
  props: {
    isEducation: { default: false, type: Boolean},
  },

  computed: {
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    authenticated(): boolean {
      return this.$store.state.authentication.isAuthenticated;
    },
    isOrganisation(): boolean {
      return (state.generalParameters.isOrganisation as boolean);
    },
    isContribution(): boolean {
      return (state.generalParameters.isContribution as boolean);
    },
  },

  methods: {
    goToUrl(url: string): void {
      if (this.authenticated) {
        this.$router.push(url);
      }
    },
  },
})
</script>

<style lang="scss">
.top-bar-dropdown {
  display: flex;
  align-items: center;

  .main-button-dropdown {
    padding-bottom: 0.4rem;
    width: 140px;
    text-align: left;
    padding-left: 15px;
    margin-right: 30px;
    @media (max-width: 650px) {
      display: none;
    }
  }
  .btn-group .dropdown-toggle-split {
    align-items: center;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    justify-content: center;
    position: absolute;
    right: 5px;
    border: 4px solid white !important;
    z-index: 2;
    @media (max-width: 650px) {
      position: relative;
      right: auto;
    }
  }
}
</style>