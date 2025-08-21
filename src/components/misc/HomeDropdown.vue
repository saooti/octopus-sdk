<template>
  <div class="d-flex align-items-center">
    <button
      v-if="isAuthenticatedWithOrga"
      :title="t('My space')"
      class="btn admin-button hide-small-screen m-1 text-blue-octopus"
      @click="goToAdministration"
    >
      <AppsIcon :size="30" />
    </button>
    <router-link
      v-if="isAuthenticatedWithOrga && authStore.isRoleContribution"
      :title="t('Upload')"
      to="/main/priv/upload"
      class="btn admin-button hide-small-screen m-1 text-blue-octopus"
    >
      <DownloadIcon :size="30" />
    </router-link>
    <button
      v-show="!mobileMenuDisplay || isAuthenticatedWithOrga"
      id="home-dropdown"
      class="btn m-1 admin-button hide-small-screen text-blue-octopus"
      :title="t('User menu')"
    >
      <AccountIcon :size="30" />
    </button>
    <ClassicPopover
      target="home-dropdown"
      popover-class="popover-z-index"
      :only-click="true"
      :is-fixed="true"
      :left-pos="true"
      :is-top-layer="true"
    >
      <UserButtonContent :isEducation="isEducation" :navLabel="t('User menu')"/>
    </ClassicPopover>
  </div>
</template>

<script setup lang="ts">
import UserButtonContent from "./UserButtonContent.vue";
import AppsIcon from "vue-material-design-icons/Apps.vue";
import AccountIcon from "vue-material-design-icons/Account.vue";
import DownloadIcon from "vue-material-design-icons/Download.vue";
import ClassicPopover from "../misc/ClassicPopover.vue";
import { useAuthStore } from "../../stores/AuthStore";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

//Props 
defineProps({
  isEducation: { default: false, type: Boolean },
  mobileMenuDisplay: { default: false, type: Boolean },
})

//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

//Computed
const isAuthenticatedWithOrga = computed(() => undefined !== authStore.authOrgaId);

//Methods
function goToAdministration() {
  if ("backoffice" !== route.name) {
    router.push("/main/priv/backoffice");
  } else if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push("/");
  }
}
</script>
