<template>
  <div class="page-box page-box-absolute bg-white justify-content-evenly">
    <img
      class="logo-octopus"
      src="/img/logo_octopus_final.svg"
      :alt="$t('Logo of main page')"
    >
    <h2>{{ $t('You do not have the right to access this page' ) }}</h2>
    <a
      class="btn btn-link"
      href="/sso/logout"
    >{{ $t('Logout') }}</a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'Error403Page',
  mounted() {
    document.title = this.$store.state.general.metaTitle;
  },
});
</script>
