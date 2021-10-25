<template>
  <div
    class="d-flex align-items-center justify-content-end flex-no-wrap top-bar-dropdown"
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
      <ul class="dropdown-menu dropdown-menu-right px-4">
        <li>
          <router-link
            v-if="isContribution && !isPodcastmaker"
            to="/main/priv/upload"
            class="align-self-center w-100"
          >
            <button class="btn btn-primary w-100 mb-2">
              {{ $t('Upload') }}
            </button>
          </router-link>
        </li>
        <li v-if="!isPodcastmaker">
          <router-link
            to="/main/priv/backoffice"
            class="linkSpace dropdown-item"
          >
            {{ $t('My space') }}
          </router-link>
        </li>
        <li v-if="!isPodcastmaker">
          <router-link
            class="dropdown-item"
            to="/main/priv/edit/profile"
          >
            {{ $t('Edit my profile') }}
          </router-link>
        </li>
        <li v-if="!isPodcastmaker && isOrganisation">
          <router-link
            class="dropdown-item"
            to="/main/priv/edit/organisation"
          >
            {{ $t('Edit my organisation') }}
          </router-link>
        </li>
        <li v-if="!isEducation">
          <hr class="dropdown-divider">
        </li>
        <li v-if="!isEducation">
          <a
            href="https://help.octopus.saooti.com/Aide/"
            class="dropdown-item"
            rel="noopener"
            target="_blank"
          >
            {{ $t('Help') }}
          </a>
        </li>
        <li v-if="!isEducation">
          <a
            href="https://help.octopus.saooti.com/"
            class="dropdown-item"
            rel="noopener"
            target="_blank"
          >
            {{ $t('TutoMag') }}
          </a>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li v-if="!isEducation">
          <a
            class="dropdown-item"
            href="/sso/logout"
          >
            {{ $t('Logout') }}
          </a>
        </li>
      </ul>
    </div>
    <div
      v-else
      class="dropdown btn-group"
    >
      <button
        class="btn dropdown-toggle btn-secondary text-decoration-none m-1 admin-button btn-rounded-icon dropdown-toggle-no-caret"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i class="saooti-user-octopus text-dark" />
        <span class="visually-hidden">Profile</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-right px-4">
        <li>
          <a
            class="dropdown-item"
            href="/sso/login"
          >
            {{ $t('Login') }}
          </a>
        </li>
        <li v-if="!isPodcastmaker">
          <router-link
            class="dropdown-item"
            to="/main/pub/create"
          >
            {{
              $t('Create an account')
            }}
          </router-link>
        </li>
      </ul>
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

  data() {
    return {
      showMenu: false as boolean
    };
  },

  computed: {
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker;
    },
    authenticated(): boolean {
      return this.$store.state.authentication.isAuthenticated;
    },
    isOrganisation(): boolean {
      return state.generalParameters.isOrganisation;
    },
    isContribution(): boolean {
      return state.generalParameters.isContribution;
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
  .main-button-dropdown {
    padding-bottom: 0.4rem;
    width: 140px;
    text-align: left;
    padding-left: 15px;
    margin-right: 30px;
  }
  .btn-group .dropdown-toggle-split {
    align-items: center;
    border-radius: 50% !important;
    width: 40px !important;
    height: 40px !important;
    display: flex;
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
  .dropdown-header {
    display: flex;
    align-items: center;
    font-weight: bold;
  }
  .linkSpace {
    display: none;
  }

  /** PHONES*/
  @media (max-width: 1200px) {
    .linkSpace {
      display: block;
    }
  }
  @media (max-width: 650px) {
    .dropdown {
      .main-button-dropdown {
        display: none;
      }
    }
    .btn-group .dropdown-toggle-split {
      height: 30px;
      width: 30px;
      border-radius: 50% !important;
    }
  }
}
</style>