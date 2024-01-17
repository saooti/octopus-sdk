<template>
  <div class="page-box page-box-absolute bg-white justify-content-evenly">
    <div class="not-auth-content d-flex-column justify-content-between">
      <div class="d-flex flex-column justify-content-around">
        <img
          width="250"
          height="auto"
          class="logo-octopus"
          src="/img/logo_octopus_final.svg"
          :alt="$t('Logo of main page')"
        />
        <h2>{{ $t("You do not have the right to access this page") }}</h2>
      </div>
      <img
        width="600"
        height="auto"
        class="stop-octopus-img"
        src="/img/403.webp"
        :alt="$t('You do not have the right to access this page')"
      />
    </div>

    <button
      v-if="authenticated"
      class="btn btn-primary"
      @click="logoutFunction"
    >
      {{ authText }}
    </button>
    <a v-else class="btn btn-primary" href="/sso/login">{{ authText }}</a>
  </div>
</template>

<script lang="ts">
import { defineTitle } from "../../helper/environment";
import crudApi from "@/api/classicCrud";
import { state } from "../../stores/ParamSdkStore";
import { useGeneralStore } from "@/stores/GeneralStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "Error403Page",
  computed: {
    ...mapState(useGeneralStore, ["metaTitle"]),
    authenticated(): boolean {
      return state.generalParameters.authenticated as boolean;
    },
    authText(): string {
      return this.authenticated ? this.$t("Logout") : this.$t("Login");
    },
  },
  mounted() {
    defineTitle(this.metaTitle);
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
  },
});
</script>
<style lang="scss">
.octopus-app .not-auth-content {
  @media (max-width: 960px) {
    align-items: center;
  }
  .stop-octopus-img {
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
