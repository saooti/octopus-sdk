<template>
  <section class="page-box">
    <template v-if="!filterStore.filterOrgaId && !organisationId && !state.generalParameters.podcastmaker">
      <div class="align-self-start fw-bold mb-2">
        {{ t("Please chose a productor") }}
      </div>
      <OrganisationChooser
        :defaultanswer="t('Please chose a productor')"
        @selected="onOrganisationSelected"
      />
    </template>
    <template v-if="filterStore.filterOrgaId || organisationId">
      <LiveList :organisation-id="organisationId" />
      <RadioList v-if="!notRadios" :organisation-id="organisationId" />
    </template>
  </section>
</template>

<script setup lang="ts">
import { state } from "../../stores/ParamSdkStore";
import { Organisation } from "@/stores/class/general/organisation";
import { defineAsyncComponent, onMounted } from "vue";
import { useFilterStore } from "../../stores/FilterStore";
import { useI18n } from "vue-i18n";
const LiveList = defineAsyncComponent(
  () => import("../display/live/LiveList.vue"),
);
const RadioList = defineAsyncComponent(
  () => import("../display/live/RadioList.vue"),
);
const OrganisationChooser = defineAsyncComponent(
  () => import("../display/organisation/OrganisationChooser.vue"),
);


//Props
const props = defineProps({
  organisationId: { default: undefined, type: String },
  productor: { default: undefined, type: String },
  notRadios: { default: false, type: Boolean },
});


//Emits
const emit = defineEmits(["update:organisationId"]);


//Composables
const { t } = useI18n();
const filterStore = useFilterStore();


onMounted(() => {
  if (props.productor) {
    emit("update:organisationId", props.productor);
  } else if (filterStore.filterOrgaId) {
    emit("update:organisationId", filterStore.filterOrgaId);
  }
})

//Methods
function onOrganisationSelected(organisation: Organisation | undefined): void {
  emit("update:organisationId", organisation?.id);
}
</script>
