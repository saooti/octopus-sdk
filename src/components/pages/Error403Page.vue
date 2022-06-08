<template>
  <div class="page-box page-box-absolute bg-white justify-content-evenly">
    <div class="not-auth-content d-flex-column justify-content-between">
      <div class="d-flex flex-column justify-content-around">
        <img
          class="logo-octopus"
          src="/img/logo_octopus_final.svg"
          :alt="$t('Logo of main page')"
        >
        <h2>{{ $t('You do not have the right to access this page' ) }}</h2>
      </div>
      <img
        class="stop-octopus-img"
        src="/img/403.jpeg"
        :alt="$t('You do not have the right to access this page')"
      >
    </div>
    
    <a
      class="btn btn-primary"
      :href="authenticated ?'/sso/logout':'/sso/login'"
    >{{ authText }}</a>
  </div>
</template>

<script lang="ts">
import { state } from '../../store/paramStore';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'Error403Page',
  computed: {
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
    },
    authText():string{
      return this.authenticated ? this.$t('Logout') : this.$t('Login');
    }
  },
  mounted() {
    document.title = this.$store.state.general.metaTitle;
  },
});
</script>
<style lang="scss">
.octopus-app .not-auth-content{
  @media (max-width: 960px) {
    align-items: center;
  }
  .stop-octopus-img{
    width: 600px;
    height: auto;
    @media (max-width: 1400px) {
      width: 400px;
    }
    @media (max-width: 450px) {
      width: 80%;
    }
  }
}
</style>