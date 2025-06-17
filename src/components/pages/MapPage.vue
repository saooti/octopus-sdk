<template>
  <section class="page-box map-page">
    <component :is="titleTag">{{ t("Site map") }}</component>
    <nav :aria-label="t('Site menu')" class="d-flex flex-column align-items-center">
      <ul class="my-1">
        <template v-for="linkItem in siteMap" :key="linkItem.id">
          <li v-if="linkItem.condition" :id="linkItem.id" class="my-1">
            <router-link class="text-dark" :to="linkItem.href">{{
              linkItem.title
            }}</router-link>
            <ul v-if="linkItem.links">
              <template v-for="subLink in linkItem.links" :key="subLink.id">
                <li v-if="subLink.condition" :id="subLink.id" class="my-1">
                  <router-link class="text-dark" :to="subLink.href">{{
                    subLink.title
                  }}</router-link>
                </li>
              </template>
            </ul>
          </li>
        </template>
      </ul>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from "../../stores/AuthStore";
import { useFilterStore } from "../../stores/FilterStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { state } from "../../stores/ParamSdkStore";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
interface LinkMapSite {
  id: string;
  title: string;
  href: string;
  condition: boolean;
  links: Array<{
    id: string;
    title: string;
    href: string;
    condition: boolean;
  }>;
}


//Props
const props = defineProps({
  externLinks: { default: () => [], type: Array as () => Array<LinkMapSite> },
    titleTag: { default: "h1", type: String },
});

//Data
const studioAuthorized = ref(true);
const radioAuthorized = ref(true);


//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const filterStore = useFilterStore();
const generalStore = useGeneralStore();


//Computed
const isAuthenticated = computed(() =>undefined !== authStore.authProfile?.userId);
const isStudioAuth = computed(() =>(authStore.isRoleLive || authStore.isRoleContribution) && studioAuthorized.value);
const isPodcastmaker = computed(() =>state.generalParameters.podcastmaker);
const organisationsAvailable = computed(() =>authStore.authProfile?.organisations ?? []);
const siteMap = computed(() =>[
  ...contentSection.value,
  ...props.externLinks,
  ...userLinks.value,
  ...adminSection.value,
  ...footerLinks.value,
]);
const contentSection = computed(() =>[
  {
    title: t("Home"),
    id: "link-page-home",
    href: "/main/pub/home",
    condition: true,
  },
  {
    title: isPodcastmaker.value? t("Live"): t("Radio & Live"),
    id: "link-page-lives",
    href: "/main/pub/lives",
    condition: true,
  },
  {
    title: t("Podcasts"),
    id: "link-page-podcasts",
    href: "/main/pub/podcasts",
    condition: true,
  },
  {
    title: t("Emissions"),
    id: "link-page-emissions",
    href: "/main/pub/emissions",
    condition: true,
  },
  {
    title: t("Speakers"),
    id: "link-page-participants",
    href: "/main/pub/participants",
    condition: true,
  },
  {
    title: t("Playlists"),
    id: "link-page-playlists",
    href: "/main/pub/playlists",
    condition: true,
  },
  {
    title: t("Productors"),
    id: "link-page-productors",
    href: "/main/pub/productors",
    condition:!isPodcastmaker.value && (!filterStore.filterOrgaId || generalStore.platformEducation),
  },
]);
const userLinks = computed(() =>[
  {
    title: t("Edit my profile"),
    href: "/main/priv/edit/profile",
    id: "link-page-profile",
    condition: !isPodcastmaker.value && isAuthenticated.value,
  },
  {
    title: t("Edit my organisation"),
    href: "/main/priv/edit/organisation",
    id: "link-page-organisation",
    condition:
      !isPodcastmaker.value &&
      isAuthenticated.value &&
      (authStore.isRoleOrganisation || 1 < organisationsAvailable.value.length),
  },
]);
const footerLinks = computed(() =>{
  if (isPodcastmaker.value || authStore.isGarRole) {
    return [];
  }
  return [
    {
      title: t("Contact"),
      href: "/main/pub/contact",
      id: "link-page-contact",
      condition: true,
    },
    {
      title: t("Term of use"),
      href: "/main/pub/cgu",
      id: "link-page-cgu",
      condition: true,
    },
    {
      title: t("Used libraries"),
      href: "/main/pub/libraries",
      id: "link-page-libraries",
      condition: true,
    },
  ];
});
const adminSection = computed(() =>{
  if (isPodcastmaker.value) {
    return [];
  }
  return [
    {
      title: t("Welcome in the Backoffice"),
      href: "/main/priv/backoffice",
      id: "link-page-backoffice",
      condition: isAuthenticated.value,
      links: [
        {
          title: t("Upload"),
          href: "/main/priv/upload",
          id: "link-page-upload",
          condition: authStore.isRoleContribution,
        },
        {
          title: t("Media library"),
          href: "/main/priv/media",
          id: "link-page-media",
          condition: isStudioAuth.value,
        },
        {
          title: t("Studio"),
          href: "/main/priv/records",
          id: "link-page-records",
          condition: isStudioAuth.value,
        },
        {
          title: t("Radio planning"),
          href: "/main/priv/radio/",
          id: "link-page-radio",
          condition: authStore.isRoleRadio && radioAuthorized.value,
        },
        {
          title: t("Edit / Delete episodes"),
          href: "/main/pub/podcasts",
          id: "link-page-edit-podcast",
          condition: true,
        },
        {
          title: t("Handle my players"),
          href: "/main/priv/players",
          id: "link-page-players",
          condition: authStore.isRoleEditor,
        },
        {
          title: t("Monetization"),
          href: "/main/priv/edit/adserv",
          id: "link-page-adserv",
          condition: authStore.isRoleAdvertising && !generalStore.platformEducation,
        },
        {
          title: t("Handle FTP"),
          href: "/main/priv/edit/ftp",
          id: "link-page-ftp",
          condition: authStore.isRoleEditor,
        },
        {
          title: t("Topics and rubrics"),
          href: "/main/priv/edit/rubrics",
          id: "link-page-rubrics",
          condition: authStore.isRoleEditor,
        },
        {
          title: t("Handle RSS"),
          href: "/main/priv/edit/rss",
          id: "link-page-rss",
          condition: authStore.isRoleEditor,
        },
        {
          title: t("Handle my participants"),
          href: "/main/priv/participants/handle",
          id: "link-page-edit-participants",
          condition: authStore.isRoleEditor,
        },
        {
          title: t("Handle comments"),
          href: "/main/priv/comments",
          id: "link-page-comments",
          condition: authStore.isRoleComments,
        },
        {
          title: t("See my statistics"),
          href: "/main/priv/show/stats",
          id: "link-page-stats",
          condition: authStore.isRoleAnalytics,
        },
        {
          title: t("Organisations management"),
          href: "/main/priv/edit/contract",
          id: "link-page-contract",
          condition: authStore.isRoleAdmin,
        },
        {
          title: t("My account"),
          href: "/main/priv/account",
          id: "link-page-account",
          condition: true,
        },
        {
          title: t("Handle my users"),
          href: "/main/priv/user/handle",
          id: "link-page-users",
          condition: authStore.isRoleUsers,
        },
      ],
    },
  ];
});


onMounted(() => {
  studioAuthorized.value = checkOrgaAttribute("studio.active");
  radioAuthorized.value = checkOrgaAttribute("radio.active");
})


//Methods
function checkOrgaAttribute(attribute: string): boolean {
  return "true" == authStore.authOrganisation.attributes?.[attribute]?.toString();
}
</script>
