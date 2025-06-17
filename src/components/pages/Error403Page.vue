<template>
  <section class="page-box page-box-absolute bg-white justify-content-evenly">
    <div class="not-auth-content d-flex-column justify-content-between">
      <div class="d-flex flex-column justify-content-around">
        <img
          width="250"
          height="auto"
          class="logo-octopus"
          src="/img/logo_saooti_play_black.svg"
          aria-hidden="true"
        alt=""
          title="Saooti"
          
        />
        <h2>{{ t("You do not have the right to access this page") }}</h2>
      </div>
      <img
        width="600"
        height="auto"
        class="stop-octopus-img"
        src="/img/403.webp"
        aria-hidden="true"
        alt=""
        
        title="403"
      />
    </div>

    <a v-if="authStore.authOrgaId" class="btn btn-primary" href="/logout">
      {{ authText }}
    </a>
    <a v-else class="btn btn-primary" :href="pathLogin">{{ authText }}</a>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useApiStore } from "../../stores/ApiStore";
import { useAuthStore } from "../../stores/AuthStore";
import { computed } from "vue";
import { useRoute } from "vue-router";

//Composables
const { t } = useI18n();
const authStore= useAuthStore();
const apiStore= useApiStore();
const route = useRoute()

//Computed
const authText = computed(() => authStore.authOrgaId ? t("Logout") : t("Login"));
const pathLogin = computed(() => "/sso/login?redirect_url="+encodeURI(apiStore.frontendUrl + route.fullPath));

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
