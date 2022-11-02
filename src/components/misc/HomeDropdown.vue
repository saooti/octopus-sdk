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
    <button
      id="home-dropdown"
      class="btn m-1 admin-button saooti-user"
      :title="$t('User menu')"
    />
    <Popover
      target="home-dropdown"
      :onlyClick="true"
      :isFixed="true"
      :leftPos="true"
    >
      <template v-if="!authenticated">
        <a
          class="octopus-dropdown-item"
          href="/sso/login"
        >
          {{ $t('Login') }}
        </a>
        <router-link
          v-if="!isPodcastmaker"
          class="octopus-dropdown-item"
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
          <hr>
          <template
            v-for="helpLink in helpLinks"
            :key="helpLink.title"
          >
            <a
              :href="helpLink.href"
              class="octopus-dropdown-item"
              rel="noopener"
              target="_blank"
            >
              {{ helpLink.title }}
            </a>
          </template>
        </template>
        <hr>
        <a
          class="octopus-dropdown-item"
          href="/sso/logout"
        >
          {{ $t('Logout') }}
        </a>
      </template>
      <router-link
        class="octopus-dropdown-item"
        to="/main/pub/contact"
      >
        {{ $t('Contact') }}
      </router-link>
    </Popover>
  </div>
</template>

<script lang="ts">
import { state } from '../../store/paramStore';
import Popover from '../misc/Popover.vue';
import { defineComponent } from 'vue'
import { Organisation } from '@/store/class/general/organisation';
export default defineComponent({
  name: 'HomeDropdown',
  props: {
    isEducation: { default: false, type: Boolean},
  },
  components:{
    Popover
  },
  computed: {
    organisationsAvailable(): Array<Organisation>{
      return this.$store.state.auth?.profile.organisations?? [];
    },
    helpLinks(){
      return [
        {title:this.$t('Help'), href:'https://help.octopus.saooti.com/Aide/'},
        {title:this.$t('TutoMag'),href:"https://help.octopus.saooti.com/"}];
    },
    routerBackoffice(){
      return [
        {title:this.$t('Upload'),class:"btn btn-primary w-100", path:'/main/priv/upload', condition: (state.generalParameters.isContribution as boolean)},
        {title:this.$t('My space'),class:"show-phone octopus-dropdown-item", path:'/main/priv/backoffice', condition: true},
        {title:this.$t('Edit my profile'),class:"octopus-dropdown-item", path:'/main/priv/edit/profile', condition: true},
        {title:this.$t('Edit my organisation'),class:"octopus-dropdown-item", path:'/main/priv/edit/organisation', condition: (state.generalParameters.isOrganisation as boolean) || 1<this.organisationsAvailable.length}];
    },
    
    isPodcastmaker(): boolean {
      return (state.generalParameters.podcastmaker as boolean);
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated??false;
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