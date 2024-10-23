<template>
  <div
    id="footer"
    ref="footer"
    class="d-flex align-items-center justify-content-between border-top mt-auto"
  >
    <div v-if="!isPodcastmaker" class="d-flex flex-column px-1">
      <div class="text-dark my-1 special-select-align-magic-trick">
        &copy; Saooti 2024
      </div>
      <router-link
        v-for="link in routerLinkSecondArray"
        :key="link.routeName"
        class="link-hover my-1 special-select-align-magic-trick"
        :to="link.routeName"
      >
        {{ link.title }}
      </router-link>
      <ClassicSelect
        v-model:text-init="language"
        :display-label="false"
        id-select="language-chooser-select"
        :label="$t('Change locale')"
        :transparent="true"
        :options="[
          { title: 'Deutsch', value: 'de' },
          { title: 'English', value: 'en' },
          { title: 'Español', value: 'es' },
          { title: 'Français', value: 'fr' },
          { title: 'Italiano', value: 'it' },
          { title: 'Slovenščina', value: 'sl' },
        ]"
        class="mb-1"
      />
      <OrganisationChooserLight
        v-if="!isPodcastmaker && organisationId && authenticated"
        page="footer"
        width="auto"
        :defaultanswer="$t('No organisation filter')"
        :value="organisationId"
        :reset="reset"
        @selected="onOrganisationSelected"
      />
    </div>
    <div class="d-flex align-items-center">
      <div class="hosted-by">
        {{ $t("Hosted by") }}<span class="ms-1 me-1 text-primary">Saooti</span>
      </div>

      <AcpmImage v-if="isGarRole" />
      <a
        v-else
        href="https://www.acpm.fr/L-ACPM/Certifications-et-Labels/Les-Podcasts"
        rel="noopener"
        target="_blank"
        :title="$t('Octopus is ACPM Podcast accredited')"
      >
        <AcpmImage />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import cookies from "../mixins/cookies";
import orgaFilter from "../mixins/organisationFilter";
import ClassicSelect from "../form/ClassicSelect.vue";
import AcpmImage from "./AcpmImage.vue";
import { state } from "../../stores/ParamSdkStore";
import { loadLocaleMessages } from "@/i18n";
import classicApi from "../../api/classicApi";
import { useFilterStore } from "../../stores/FilterStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { useAuthStore } from "../../stores/AuthStore";
import { mapState, mapActions } from "pinia";
import { Category } from "@/stores/class/general/category";
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { defineAsyncComponent, defineComponent } from "vue";
import { Organisation } from "@/stores/class/general/organisation";
const OrganisationChooserLight = defineAsyncComponent(
  () => import("../display/organisation/OrganisationChooserLight.vue"),
);
export default defineComponent({
  name: "FooterSection",
  components: {
    ClassicSelect,
    AcpmImage,
    OrganisationChooserLight,
  },

  mixins: [cookies, orgaFilter],
  data() {
    return {
      language: this.$i18n.locale,
      organisationId: undefined as string | undefined,
      reset: false as boolean,
    };
  },
  computed: {
    ...mapState(useGeneralStore, ["storedCategories", "platformEducation"]),
    ...mapState(useFilterStore, [
      "filterRubrique",
      "filterOrgaId",
      "filterIab",
    ]),
    ...mapState(useAuthStore, ["isGarRole", "authOrgaId"]),
    authenticated() {
      return undefined !== this.authOrgaId;
    },
    routerLinkSecondArray() {
      const links = [
        { title: this.$t("Contact"), routeName: "/main/pub/contact" },
        { title: this.$t("Term of use"), routeName: "/main/pub/cgu" },
      ];

      if (!this.isGarRole) {
        links.push({
          title: this.$t("Used libraries"),
          routeName: "/main/pub/libraries",
        });
      }
      return links;
    },
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    rubriqueQueryParam(): string | undefined {
      if (this.filterRubrique?.length) {
        return this.filterRubrique
          .map(
            (value: RubriquageFilter) =>
              value.rubriquageId + ":" + value.rubriqueId,
          )
          .join();
      }
      return undefined;
    },
  },
  watch: {
    language() {
      this.changeLanguage();
    },
    filterOrgaId: {
      immediate: true,
      handler() {
        if (this.filterOrgaId) {
          this.organisationId = this.filterOrgaId;
        } else {
          this.reset = !this.reset;
        }
      },
    },
  },
  methods: {
    ...mapActions(useGeneralStore, ["storedUpdateCategories"]),
    ...mapActions(useFilterStore, ["filterUpdateIab"]),
    getQueriesRouter(routeName: string) {
      if (
        "podcasts" !== routeName &&
        "emissions" !== routeName &&
        "home" !== routeName
      ) {
        return { productor: this.filterOrgaId };
      }
      return {
        productor: this.filterOrgaId,
        iabId: this.filterIab?.id,
        rubriquesId: this.rubriqueQueryParam,
      };
    },
    changeLanguage(): void {
      this.setCookie("octopus-language", this.language);
      loadLocaleMessages(
        this.$i18n,
        this.language,
        this.authenticated,
        this.platformEducation,
      );
      classicApi
        .fetchData<Array<Category>>({
          api: 0,
          path: `iab/list${this.authOrgaId ? "/" + this.authOrgaId : ""}`,
          parameters: { lang: this.$i18n.locale },
        })
        .then((data: Array<Category>) => {
          this.storedUpdateCategories(data);
          if (this.filterIab) {
            const category = this.storedCategories.filter((c: Category) => {
              return c.id === this.filterIab?.id;
            });
            if (category.length) {
              this.filterUpdateIab(category[0]);
            }
          }
        });
    },
    async onOrganisationSelected(
      organisation: Organisation | undefined,
    ): Promise<void> {
      if (organisation?.id) {
        await this.selectOrganisation(organisation.id);
        return;
      }
      this.organisationId = undefined;
      this.removeSelectedOrga();
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  #footer {
    font-size: 0.6rem;
    bottom: 0;
    z-index: 10;
    background: white;
    padding: 0 2rem;
    a {
      color: #666;
    }
    .special-select-align-magic-trick {
      margin-left: 0.16rem;
    }
  }
}
</style>
