<template>
  <div
    class="d-flex align-items-center"
  >
    <router-link
      v-if="authenticated"
      :title="$t('My space')"
      to="/main/priv/backoffice"
      class="btn admin-button hide-smallest-screen m-1 saooti-admin-menu"
    />
    <router-link
      v-if="isContribution"
      :title="$t('Upload')"
      to="/main/priv/upload"
      class="btn admin-button hide-smallest-screen m-1 saooti-upload"
    />
    <button
      id="home-dropdown"
      class="btn m-1 admin-button saooti-user"
      :title="$t('User menu')"
    />
    <Popover
      target="home-dropdown"
      :only-click="true"
      :is-fixed="true"
      :left-pos="true"
    >
      <template v-if="!authenticated">
        <a
          class="octopus-dropdown-item"
          href="/sso/login"
          realLink="true"
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
              realLink="true"
            >
              {{ helpLink.title }}
            </a>
          </template>
        </template>
        <hr>
        <a
          class="octopus-dropdown-item"
          href="/sso/logout"
          realLink="true"
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
import { state } from '../../stores/ParamSdkStore';
import Popover from '../misc/Popover.vue';
import { useAuthStore } from '@/stores/AuthStore';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
import { Organisation } from '@/stores/class/general/organisation';
export default defineComponent({
  name: 'HomeDropdown',
  components:{
    Popover
  },
  props: {
    isEducation: { default: false, type: Boolean},
  },
  computed: {
    ...mapState(useAuthStore, ['authProfile']),
    organisationsAvailable(): Array<Organisation>{
      return this.authProfile.organisations?? [];
    },
    helpLinks(){
      return [
        {title:this.$t('Help'), href:'https://help.octopus.saooti.com/Aide/'},
        {title:this.$t('TutoMag'),href:"https://help.octopus.saooti.com/"}];
    },
    routerBackoffice(){
      return [
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
    isContribution(): boolean {
      return state.generalParameters.isContribution??false;
    },
  },

})
</script>