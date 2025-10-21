<template>
  <footer
    id="footer"
    ref="footer"
    role="contentinfo"
    class="d-flex align-items-center justify-content-between border-top mt-auto"
  >
    <div
      v-if="!state.generalParameters.podcastmaker"
      class="d-flex flex-column px-1"
    >
      <div class="text-dark my-1 special-select-align-magic-trick">
        &copy; Saooti 2025
      </div>
      <FooterGarSection
        v-if="authStore.isGarRole"
        :auth-orga-id="authStore.authOrgaId"
      />
      <nav :aria-label="t('Site menu')">
        <ul class="p-0 m-0">
          <li 
            v-for="link in routerLinkSecondArray"
            :key="link.routeName"
            class="li-style-none my-1"
          >
            <router-link
              class="link-hover special-select-align-magic-trick"
              :to="link.routeName"
            >
              {{ link.title }}
            </router-link>
          </li>
        </ul>
      </nav>
      <ClassicSelect
        v-model:text-init="language"
        :display-label="false"
        id-select="language-chooser-select"
        :label="t('Change locale')"
        :transparent="true"
        :options="[
          { title: 'Deutsch', value: 'de' },
          { title: 'English', value: 'en' },
          { title: 'Español', value: 'es' },
          { title: 'Français', value: 'fr' },
          { title: 'Italiano', value: 'it' },
          { title: 'Slovenščina', value: 'sl' },
        ]"
        class="my-1"
      />
      <OrganisationChooserLight
        v-if="!state.generalParameters.podcastmaker && organisationId && authenticated"
        page="footer"
        width="auto"
        class="my-1"
        :defaultanswer="t('No organisation filter')"
        :value="organisationId"
        :reset="reset"
        @selected="onOrganisationSelected"
      />
    </div>
    <div class="d-flex align-items-center">
      <div class="hosted-by">
        {{ t("Hosted by") }}<span class="ms-1 me-1 text-primary">Saooti</span>
      </div>

      <AcpmImage v-if="authStore.isGarRole" />
      <a
        v-else
        href="https://www.acpm.fr/L-ACPM/Certifications-et-Labels/Les-Podcasts"
        rel="noreferrer noopener"
        target="_blank"
        :title="t('New window', {text: t('Octopus is ACPM Podcast accredited')})"
      >
        <AcpmImage />
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import cookiesHelper from "../../helper/cookiesHelper";
import ClassicSelect from "../form/ClassicSelect.vue";
import AcpmImage from "./AcpmImage.vue";
import { state } from "../../stores/ParamSdkStore";
import { loadLocaleMessages } from "@/i18n";
import classicApi from "../../api/classicApi";
import { useFilterStore } from "../../stores/FilterStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { useAuthStore } from "../../stores/AuthStore";
import { Category } from "@/stores/class/general/category";
import { computed, defineAsyncComponent, Ref, ref, watch } from "vue";
import { Organisation } from "@/stores/class/general/organisation";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
const OrganisationChooserLight = defineAsyncComponent(
  () => import("../display/organisation/OrganisationChooserLight.vue"),
);
const FooterGarSection = defineAsyncComponent(
  () => import("./FooterGarSection.vue"),
);
const i18n = useI18n();
const { t, locale } = useI18n();

//Data 
const language = ref(locale);
const reset = ref(false);
const organisationId: Ref<string | undefined> = ref(undefined);

//Composables
const generalStore = useGeneralStore();
const filterStore = useFilterStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();


//Computed
const authenticated = computed(() => undefined !== authStore.authOrgaId);
const routerLinkSecondArray = computed(() => {
  const links = [];
  if (!authStore.isGarRole) {
    links.push(
      { title: t("Contact"), routeName: "/main/pub/contact" },
      { title:t("Used libraries"), routeName: "/main/pub/libraries"},
      { title: t("Term of use"), routeName: "/main/pub/cgu" },
    );
  }
  links.push({ title: t("Site map"), routeName: "/main/pub/map" });
  return links;
});


//Watch
watch(language, () => changeLanguage());
watch(()=>filterStore.filterOrgaId, () => {
  if (filterStore.filterOrgaId) {
    organisationId.value = filterStore.filterOrgaId;
  } else {
    reset.value = !reset.value;
  }
}, {immediate: true});



//Methods
function changeLanguage(): void {
  cookiesHelper.setCookie("octopus-language", language.value);
  loadLocaleMessages(
    i18n,
    language.value,
    authenticated.value,
    generalStore.platformEducation,
  );
  classicApi
  .fetchData<Array<Category>>({
    api: 0,
    path: `iab/list${authStore.authOrgaId ? "/" + authStore.authOrgaId : ""}`,
    parameters: { lang: language.value },
  })
  .then((data: Array<Category>) => {
    generalStore.storedUpdateCategories(data);
    if (filterStore.filterIab) {
      const category = generalStore.storedCategories.filter((c: Category) => {
        return c.id === filterStore.filterIab?.id;
      });
      if (category.length) {
        filterStore.filterUpdateIab(category[0]);
      }
    }
  });
}

/**
 * Select another organisation
 * @param organisation The new organisation to focus on, or undefined to remove focus
 */
async function onOrganisationSelected( organisation: Organisation | undefined): Promise<void> {
  // TODO use router utils
  if (organisation?.id) {
    router.push({
      query: { ...route.query, ...{ productor: organisation.id, o:undefined, displayAll: undefined } },
    });
  }else{
    organisationId.value = undefined;
    router.push({
      query: { ...route.query, ...{ productor: undefined, displayAll: "true" } },
    });
  }
}
</script>

<style lang="scss">
.octopus-app {
  #footer {
    font-size: max(0.6rem, 12px);
    bottom: 0;
    z-index: 10;
    background: white;
    padding: 0 2rem;

    a,
    .link-hover.btn-transparent {
      font-weight: 500;
      color: var(--octopus-gray-text) !important;
    }

    .special-select-align-magic-trick {
      margin-left: 0.16rem;
    }
  }
}
</style>
