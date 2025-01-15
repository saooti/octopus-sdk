<template>
  <section class="page-box page-box-absolute bg-white justify-content-evenly">
    <div class="not-auth-content d-flex-column justify-content-between">
      <div class="d-flex flex-column justify-content-around">
        <img
          width="250"
          height="auto"
          class="logo-octopus"
          src="/img/logo_saooti_play_black.webp"
          role="presentation"
          alt=""
        />
        <h2>{{ $t("You do not have the right to access this page") }}</h2>
      </div>
      <img
        width="600"
        height="auto"
        class="stop-octopus-img"
        src="/img/403.webp"
        role="presentation"
        alt=""
      />
    </div>

    <a v-if="authOrgaId" class="btn btn-primary" href="/logout">
      {{ authText }}
    </a>
    <a v-else class="btn btn-primary" href="/sso/login">{{ authText }}</a>
  </section>
</template>

<script lang="ts">
import { useAuthStore } from "../../stores/AuthStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "Error403Page",
  computed: {
    ...mapState(useAuthStore, ["authOrgaId"]),
    authText(): string {
      return this.authOrgaId ? this.$t("Logout") : this.$t("Login");
    },
  },
});
</script>
<style lang="scss">
.octopus-app .not-auth-content {
  @media (width <= 960px) {
    align-items: center;
  }

  .stop-octopus-img {
    width: 600px;
    height: auto;

    @media (width <= 1400px) {
      width: 400px;
    }

    @media (width <= 450px) {
      width: 80%;
    }
  }
}
</style>
