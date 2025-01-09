<template>
  <section class="page-box map-page">
    <component :is="titleTag">{{ $t("Site map") }}</component>
    <nav :aria-label="$t('Site menu')" class="d-flex flex-column align-items-center">
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

<script lang="ts">
import { mapState } from "pinia";
import { useAuthStore } from "../../stores/AuthStore";
import { useFilterStore } from "../../stores/FilterStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { state } from "../../stores/ParamSdkStore";
import { defineComponent } from "vue";
import { Organisation } from "@/stores/class/general/organisation";
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
export default defineComponent({
  props: {
    externLinks: { default: () => [], type: Array as () => Array<LinkMapSite> },
    titleTag: { default: "h1", type: String },
  },

  data() {
    return {
      studioAuthorized: true as boolean,
      radioAuthorized: true as boolean,
    };
  },
  computed: {
    ...mapState(useGeneralStore, ["platformEducation"]),
    ...mapState(useFilterStore, ["filterOrgaId"]),
    ...mapState(useAuthStore, [
      "authProfile",
      "authOrgaId",
      "authOrganisation",
      "isRoleAdmin",
      "isRoleAnimator",
      "isRoleUsers",
      "isRoleLive",
      "isRoleContribution",
      "isRoleComments",
      "isRoleEditor",
      "isRoleAnalytics",
      "isRoleAdvertising",
      "isRoleOrganisation",
      "isRoleRadio",
      "isGarRole",
    ]),
    isAuthenticated(): boolean {
      return undefined !== this.authProfile?.userId;
    },
    isStudioAuth(): boolean {
      return (
        (this.isRoleLive || this.isRoleContribution) && this.studioAuthorized
      );
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    organisationsAvailable(): Array<Organisation> {
      return this.authProfile?.organisations ?? [];
    },
    siteMap() {
      return [
        ...this.contentSection,
        ...this.externLinks,
        ...this.userLinks,
        ...this.adminSection,
        ...this.footerLinks,
      ];
    },
    contentSection() {
      return [
        {
          title: this.$t("Home"),
          id: "link-page-home",
          href: "/main/pub/home",
          condition: true,
        },
        {
          title: this.isPodcastmaker
            ? this.$t("Live")
            : this.$t("Radio & Live"),
          id: "link-page-lives",
          href: "/main/pub/lives",
          condition: true,
        },
        {
          title: this.$t("Podcasts"),
          id: "link-page-podcasts",
          href: "/main/pub/podcasts",
          condition: true,
        },
        {
          title: this.$t("Emissions"),
          id: "link-page-emissions",
          href: "/main/pub/emissions",
          condition: true,
        },
        {
          title: this.$t("Speakers"),
          id: "link-page-participants",
          href: "/main/pub/participants",
          condition: true,
        },
        {
          title: this.$t("Playlists"),
          id: "link-page-playlists",
          href: "/main/pub/playlists",
          condition: true,
        },
        {
          title: this.$t("Productors"),
          id: "link-page-productors",
          href: "/main/pub/productors",
          condition:
            !this.isPodcastmaker && (!this.filterOrgaId || this.platformEducation),
        },
      ];
    },
    userLinks() {
      return [
        {
          title: this.$t("Edit my profile"),
          href: "/main/priv/edit/profile",
          id: "link-page-profile",
          condition: !this.isPodcastmaker && this.isAuthenticated,
        },
        {
          title: this.$t("Edit my organisation"),
          href: "/main/priv/edit/organisation",
          id: "link-page-organisation",
          condition:
            !this.isPodcastmaker &&
            this.isAuthenticated &&
            (this.isRoleOrganisation || 1 < this.organisationsAvailable.length),
        },
      ];
    },
    footerLinks() {
      if (this.isPodcastmaker || this.isGarRole) {
        return [];
      }
      return [
        {
          title: this.$t("Contact"),
          href: "/main/pub/contact",
          id: "link-page-contact",
          condition: true,
        },
        {
          title: this.$t("Term of use"),
          href: "/main/pub/cgu",
          id: "link-page-cgu",
          condition: true,
        },
        {
          title: this.$t("Used libraries"),
          href: "/main/pub/libraries",
          id: "link-page-libraries",
          condition: true,
        },
      ];
    },
    adminSection() {
      if (this.isPodcastmaker) {
        return [];
      }
      return [
        {
          title: this.$t("Welcome in the Backoffice"),
          href: "/main/priv/backoffice",
          id: "link-page-backoffice",
          condition: this.isAuthenticated,
          links: [
            {
              title: this.$t("Upload"),
              href: "/main/priv/upload",
              id: "link-page-upload",
              condition: this.isRoleContribution,
            },
            {
              title: this.$t("Media library"),
              href: "/main/priv/media",
              id: "link-page-media",
              condition: this.isStudioAuth,
            },
            {
              title: this.$t("Studio"),
              href: "/main/priv/records",
              id: "link-page-records",
              condition: this.isStudioAuth,
            },
            {
              title: this.$t("Radio planning"),
              href: "/main/priv/radio/",
              id: "link-page-radio",
              condition: this.isRoleRadio && this.radioAuthorized,
            },
            {
              title: this.$t("Edit / Delete episodes"),
              href: "/main/pub/podcasts",
              id: "link-page-edit-podcast",
              condition: true,
            },
            {
              title: this.$t("Handle my players"),
              href: "/main/priv/players",
              id: "link-page-players",
              condition: this.isRoleEditor,
            },
            {
              title: this.$t("Monetization"),
              href: "/main/priv/edit/adserv",
              id: "link-page-adserv",
              condition: this.isRoleAdvertising && !this.platformEducation,
            },
            {
              title: this.$t("Handle FTP"),
              href: "/main/priv/edit/ftp",
              id: "link-page-ftp",
              condition: this.isRoleEditor,
            },
            {
              title: this.$t("Rubrics and topics"),
              href: "/main/priv/edit/rubrics",
              id: "link-page-rubrics",
              condition: this.isRoleEditor,
            },
            {
              title: this.$t("Handle RSS"),
              href: "/main/priv/edit/rss",
              id: "link-page-rss",
              condition: this.isRoleEditor,
            },
            {
              title: this.$t("Handle my participants"),
              href: "/main/priv/participants/handle",
              id: "link-page-edit-participants",
              condition: this.isRoleEditor,
            },
            {
              title: this.$t("Handle comments"),
              href: "/main/priv/comments",
              id: "link-page-comments",
              condition: this.isRoleComments,
            },
            {
              title: this.$t("See my statistics"),
              href: "/main/priv/show/stats",
              id: "link-page-stats",
              condition: this.isRoleAnalytics,
            },
            {
              title: this.$t("Organisations management"),
              href: "/main/priv/edit/contract",
              id: "link-page-contract",
              condition: this.isRoleAdmin,
            },
            {
              title: this.$t("My account"),
              href: "/main/priv/account",
              id: "link-page-account",
              condition: true,
            },
            {
              title: this.$t("Handle my users"),
              href: "/main/priv/user/handle",
              id: "link-page-users",
              condition: this.isRoleUsers,
            },
          ],
        },
      ];
    },
  },
  created() {
    this.studioAuthorized = this.checkOrgaAttribute("studio.active");
    this.radioAuthorized = this.checkOrgaAttribute("radio.active");
  },
  methods: {
    checkOrgaAttribute(attribute: string): boolean {
      return (
        "true" == this.authOrganisation.attributes?.[attribute]?.toString()
      );
    },
  },
});
</script>
