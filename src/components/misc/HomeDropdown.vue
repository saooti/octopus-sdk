<template>
  <div class="d-flex align-items-center justify-content-end flex-no-wrap top-bar-dropdown">
		<b-dropdown
		class="split-dropdown"
		split
		right
		split-variant="primary main-button-dropdown"
		variant="primary data-selenium-dropdown-topbar"
		@click="goToUrl('/main/priv/backoffice')"
		:text="$t('My space')"
		v-if="authenticated"
		>
		<b-dropdown-text>
				<router-link to="/main/priv/upload" v-if="isProduction && !isPodcastmaker" class="align-self-center w-100 mb-2">
				<button class="btn btn-primary w-100">{{ $t('Upload') }}</button>
				</router-link>
				<template @click="displayMenuPhone(true)">
				<b-dropdown-item to="/main/priv/backoffice" class="linkSpace" v-if="!isPodcastmaker">{{ $t('My space') }}</b-dropdown-item>
				<b-dropdown-item to="/main/priv/edit/profile" v-if="!isPodcastmaker">{{ $t('Edit my profile') }}</b-dropdown-item>
				<b-dropdown-item to="/main/priv/edit/organisation" v-if="!isPodcastmaker && isOrganisation">{{$t('Edit my organisation')}}</b-dropdown-item>
				<b-dropdown-divider v-if="!isEducation"></b-dropdown-divider>
				<b-dropdown-item href="https://help.octopus.saooti.com/Aide/" target="_blank" v-if="!isEducation">{{$t('Help')}}</b-dropdown-item>
				<b-dropdown-item href="https://help.octopus.saooti.com/" target="_blank" v-if="!isEducation">{{ $t('TutoMag') }}</b-dropdown-item>
				<b-dropdown-divider></b-dropdown-divider>
				<b-dropdown-item href="/sso/logout">{{ $t('Logout') }}</b-dropdown-item>
				</template>
		</b-dropdown-text>
		</b-dropdown>
		<b-dropdown right toggle-class="text-decoration-none  m-1 admin-button btn-rounded-icon" no-caret v-else>
		<template v-slot:button-content>
				<i class="saooti-user-octopus text-dark"></i><span class="sr-only">Profile</span>
		</template>
				<b-dropdown-item href="/sso/login">{{ $t('Login') }}</b-dropdown-item>
				<b-dropdown-item to="/main/pub/create" v-if="!isPodcastmaker">{{$t('Create an account')}}</b-dropdown-item>
		</b-dropdown>
  </div>
</template>
<style lang="scss">
.top-bar-dropdown{
	.main-button-dropdown {
		padding-bottom: 0.4rem;
		width: 140px;
		text-align: left;
		padding-left: 25px;
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
	.b-dropdown-text{
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.dropdown-header{
		display: flex;
		align-items: center;
		font-weight: bold;
	}
	.linkSpace{
		display: none;
	}

	/** PHONES*/
	@media (max-width: 1200px) {
		.linkSpace{
			display: block;
		}
	}
	@media (max-width: 650px) {
		.dropdown{
			.main-button-dropdown{
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

<script>
import {state} from "../../store/paramStore.js";

export default {
  name: "HomeDropdown",


  props: ["isEducation"],

  data() {
    return {
    };
  },

  computed: {
    isPodcastmaker(){
      return state.generalParameters.podcastmaker;
    },
    authenticated(){
      return this.$store.state.authentication.isAuthenticated;
    },
    isOrganisation(){
      return state.generalParameters.isOrganisation;
    },
    isProduction(){
      return state.generalParameters.isProduction;
    },
  },

  methods: {
    displayMenuPhone(hidden) {
      if (hidden) {
        this.$refs.menu.className = "menu hid";
      } else {
        this.$refs.menu.className = "menu";
      }
    },
    goToUrl(url){
      if(this.authenticated){
        this.$router.push(url);
      }
    }
  },
};
</script>
