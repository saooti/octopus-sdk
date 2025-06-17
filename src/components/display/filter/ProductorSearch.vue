<template>
  <div id="productor-search" class="d-flex-column align-items-center my-3">
    <div
      v-if="!state.generalParameters.podcastmaker && !filterStore.filterOrgaId"
      class="w-50-responsive pe-3 position-relative"
    >
      <OrganisationChooser
        :defaultanswer="t('No organisation filter')"
        :orga-id-selected="organisationId"
        @selected="onOrganisationSelected"
      />
      <template  v-if="!authStore.authOrgaId ||authStore.authOrgaId ===organisationId">
        <ClassicCheckbox
          v-model:text-init="keepOrganisation"
          :class="!!organisationId ? '' : 'invisible'"
          class="m-3"
          :label="
            t(
              'check this box if you want to keep this filter for the rest of your visit',
            )
          "
          :display-label="false"
          id-checkbox="organisation-checkbox"
          @click-action="onKeepOrganisation"
        />
        <div v-if="showBubble" class="filter-speech-bubble">
          {{
            t(
              "check this box if you want to keep this filter for the rest of your visit",
            )
          }}
        </div>
      </template>
    </div>
    <ClassicSearch
      :text-init="searchPattern"
      class="w-50-responsive"
      :autofocus="true"
      id-search="productor-search-input"
      :label="searchText"
      @update:text-init="updateSearchPattern"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouteUpdateParams } from "../../composable/route/useRouteUpdateParams";
import ClassicSearch from "../../form/ClassicSearch.vue";
import { state } from "../../../stores/ParamSdkStore";
import { Organisation } from "@/stores/class/general/organisation";
import { useFilterStore } from "../../../stores/FilterStore";
import { defineAsyncComponent, ref, computed, watch, onBeforeMount } from "vue";
import { useAuthStore } from "../../../stores/AuthStore";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
const OrganisationChooser = defineAsyncComponent(
  () => import("../organisation/OrganisationChooser.vue"),
);
const ClassicCheckbox = defineAsyncComponent(
  () => import("../../form/ClassicCheckbox.vue"),
);

//Props 
const props = defineProps({
  organisationId: { default: undefined, type: String },
  searchPattern: { default: "", type: String },
  type: { default: "podcast", type: String },
})

//Emits
const emit = defineEmits(["update:organisationId", "update:searchPattern"]);

//Data 
const keepOrganisation = ref(false);
const showBubble = ref(false);

//Composables
const { t } = useI18n();
const { updateRouteParam } = useRouteUpdateParams();
const filterStore = useFilterStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();


//Computed
const searchText = computed(() => {
  if ("emission" === props.type) return t("Look for emission name");
  if ("participant" === props.type)
    return t("Look for participant name");
  if ("playlist" === props.type) return t("Look for playlist name");
  return t("Look for podcast name");
});


//Watch
watch(()=>filterStore.filterOrgaId, async () => {
  keepOrganisation.value = undefined !== filterStore.filterOrgaId;
  if (filterStore.filterOrgaId) {
    emit("update:organisationId", filterStore.filterOrgaId);
  }else{
    updateRouteParam({ o: props.organisationId, productor:undefined});
  }
});
 

onBeforeMount(()=>{
  if (!props.organisationId) return;
  if (filterStore.filterOrgaId === props.organisationId) {
    keepOrganisation.value = true;
  }
})


//Methods
function updateSearchPattern(newSearch: string) {
  emit("update:searchPattern", newSearch);
}
function onOrganisationSelected(organisation: Organisation): void {
  updateRouteParam({ o: organisation.id, productor: undefined });
  keepOrganisation.value = false;
  if (!organisation?.id) {
    emit("update:organisationId", undefined);
  }
  emit("update:organisationId", organisation.id);
  if (undefined===authStore.authOrgaId && "PUBLIC" !== organisation.privacy) {
    onKeepOrganisation(organisation.id);
  } else {
    showBubble.value = true;
    setTimeout(() => {
      showBubble.value = false;
    }, 6000);
  }
}
async function onKeepOrganisation(orgaId: string|undefined = undefined): Promise<void> {
  const orgaToApply= orgaId ?? props.organisationId;
  if (!orgaToApply) {
    return;
  }
  router.push({
    query: { ...route.query, ...{ productor: orgaToApply, o:undefined }},
  });
}
</script>

<style lang="scss">

.octopus-app {
  .filter-speech-bubble {
    position: absolute;
    background: var(--octopus-primary);
    border-radius: var(--octopus-border-radius);
    width: 10rem;
    right: 4rem;
    padding: 5px;
    animation: fadein 1s;
    color: white;
  }

  .filter-speech-bubble::after {
    content: "";
    position: absolute;
    right: 0;
    top: 50%;
    width: 0;
    height: 0;
    border: 18px solid transparent;
    border-left-color: var(--octopus-primary);
    border-right: 0;
    border-bottom: 0;
    margin-top: -9px;
    margin-right: -18px;
    animation: fadein 1s;
  }
  @keyframes fadein {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
</style>
