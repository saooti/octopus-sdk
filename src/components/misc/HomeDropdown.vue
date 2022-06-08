<template>
  <div
    class="d-flex align-items-center"
  >
    <button
      v-if="authenticated"
      class="btn btn-primary hide-phone m-1"
      @click="goToUrl('/main/priv/backoffice')"
    >
      {{ $t('My space') }}
    </button>
    <div
      class="dropdown btn-group"
    >
      <button
        class="btn dropdown-toggle m-1 admin-button dropdown-toggle-no-caret saooti-user-octopus"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        :title="$t('User menu')"
      />
      <div class="dropdown-menu dropdown-menu-right px-4">
        <template v-if="!authenticated">
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
          </template>
          <hr class="dropdown-divider">
          <a
            class="dropdown-item"
            href="/sso/logout"
          >
            {{ $t('Logout') }}
          </a>
        </template>
        <router-link
          class="dropdown-item"
          to="/main/pub/contact"
        >
          {{ $t('Contact') }}
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
 /*    helpLink(){
      return [
        {title:this.$t('Help'), href:'https://help.octopus.saooti.com/Aide/'},
        {title:this.$t('TutoMag'),href:"https://help.octopus.saooti.com/"}];
    }, */
    routerBackoffice(){
      return [
        {title:this.$t('Upload'),class:"btn btn-primary w-100", path:'/main/priv/upload', condition: this.isContribution},
        {title:this.$t('My space'),class:"show-phone dropdown-item", path:'/main/priv/backoffice', condition: true},
        {title:this.$t('Edit my profile'),class:"dropdown-item", path:'/main/priv/edit/profile', condition: true},
        {title:this.$t('Edit my organisation'),class:"dropdown-item", path:'/main/priv/edit/organisation', condition: this.isOrganisation}];
    },
    
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