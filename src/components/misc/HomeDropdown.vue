<template>
  <div
    class="d-flex align-items-center justify-content-end flex-no-wrap top-bar-dropdown"
  >
    <b-dropdown
      v-if="authenticated"
      class="split-dropdown"
      split
      right
      split-variant="primary main-button-dropdown"
      variant="primary data-selenium-dropdown-topbar"
      :text="$t('My space')"
      @click="goToUrl('/main/priv/backoffice')"
    >
      <b-dropdown-text>
        <router-link
          v-if="isContribution && !isPodcastmaker"
          to="/main/priv/upload"
          class="align-self-center w-100 mb-2"
        >
          <button class="btn btn-primary w-100">
            {{ $t('Upload') }}
          </button>
        </router-link>
        <div @click="displayMenuPhone(true)">
          <b-dropdown-item
            v-if="!isPodcastmaker"
            to="/main/priv/backoffice"
            class="linkSpace"
          >
            {{ $t('My space') }}
          </b-dropdown-item>
          <b-dropdown-item
            v-if="!isPodcastmaker"
            to="/main/priv/edit/profile"
          >
            {{ $t('Edit my profile') }}
          </b-dropdown-item>
          <b-dropdown-item
            v-if="!isPodcastmaker && isOrganisation"
            to="/main/priv/edit/organisation"
          >
            {{ $t('Edit my organisation') }}
          </b-dropdown-item>
          <b-dropdown-divider v-if="!isEducation" />
          <b-dropdown-item
            v-if="!isEducation"
            href="https://help.octopus.saooti.com/Aide/"
            rel="noopener"
            target="_blank"
          >
            {{ $t('Help') }}
          </b-dropdown-item>
          <b-dropdown-item
            v-if="!isEducation"
            href="https://help.octopus.saooti.com/"
            rel="noopener"
            target="_blank"
          >
            {{ $t('TutoMag') }}
          </b-dropdown-item>
          <b-dropdown-divider />
          <b-dropdown-item href="/sso/logout">
            {{
              $t('Logout')
            }}
          </b-dropdown-item>
        </div>
      </b-dropdown-text>
    </b-dropdown>
    <b-dropdown
      v-else
      right
      toggle-class="text-decoration-none  m-1 admin-button btn-rounded-icon"
      no-caret
    >
      <template #button-content>
        <i class="saooti-user-octopus text-dark" /><span class="sr-only">Profile</span>
      </template>
      <b-dropdown-item href="/sso/login">
        {{ $t('Login') }}
      </b-dropdown-item>
      <b-dropdown-item
        v-if="!isPodcastmaker"
        to="/main/pub/create"
      >
        {{
          $t('Create an account')
        }}
      </b-dropdown-item>
    </b-dropdown>
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
    return {};
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
    displayMenuPhone(hidden: boolean): void {
      if (hidden) {
        (this.$refs.menu as HTMLElement).className='menu hid';
      } else {
        (this.$refs.menu as HTMLElement).className='menu';
      }
    },
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
  .b-dropdown-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
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