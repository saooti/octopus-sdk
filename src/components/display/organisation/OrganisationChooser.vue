<template>
  <ClassicMultiselect
    v-if="!orgaIdSelected || initLoaded"
    id="organisation-chooser"
    ref="selectOrganisation"
    option-label="name"
    :label="label ??t('select productor')"
    :display-label="displayLabel"
    :max-element="maxElement"
    :width="width"
    :in-modal="inModal"
    :option-chosen="organisationChosen"
    option-custom-templating="optionTemplating"
    option-selected-custom-templating="optionTemplating"
    :no-deselect="noDeselect"
    @on-search="onSearchOrganisation"
    @selected="emit('selected', $event)"
  >
    <template v-if="isImage" #optionTemplating="{ option }">
      <div
        class="d-flex align-items-center"
        :data-selenium="'organisation-chooser-' + seleniumFormat(option.name)"
      >
        <img
          v-lazy="useProxyImageUrl(option.imageUrl, '32')"
          width="32"
          height="32"
          class="me-2"
          aria-hidden="true"
        alt=""
          
          :title="t('Organisation name image', { name: option.name })"
        />
        <span>
          {{ option.name }}
        </span>
      </div>
    </template>
  </ClassicMultiselect>
</template>

<script setup lang="ts">
import { useAuthStore } from "../../../stores/AuthStore";
import {useImageProxy} from "../../composable/useImageProxy";
import {useSelenium} from "../../composable/useSelenium";
import classicApi from "../../../api/classicApi";
import ClassicMultiselect from "../../form/ClassicMultiselect.vue";
import { computed, onBeforeMount, ref, Ref, useTemplateRef, watch } from "vue";
import {
  emptyOrgaData,
  Organisation,
} from "../../../stores/class/general/organisation";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  defaultanswer: { default: "", type: String },
  orgaIdSelected: { default: undefined, type: String },
  reset: { default: false, type: Boolean },
  width: { default: "100%", type: String },
  isImage: { default: true, type: Boolean },
  inModal: { default: false, type: Boolean },
  noDeselect: { default: true, type: Boolean },
  label:{default: undefined, type: String },
  displayLabel: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits(["selected"]);
  
//Data 
const maxElement = ref(50);
const organisationChosen: Ref<Organisation | undefined> = ref(undefined);
const initLoaded = ref(false);
const selectOrganisationRef = useTemplateRef('selectOrganisation');

//Composables
const { t } = useI18n();
const { seleniumFormat } = useSelenium();
const { useProxyImageUrl } = useImageProxy();
const authStore = useAuthStore();
const saveFetchStore = useSaveFetchStore();


//Computed
const getDefaultOrganisation = computed(() => {
  if ("" === props.defaultanswer) {
    return undefined;
  }
  return emptyOrgaData(props.defaultanswer);
});
const myOrganisation = computed(() => {
  if (!authStore.authOrgaId) return undefined;
  return {
    ...authStore.authOrganisation,
    ...{
      name: `${t("Edit my organisation")} (${
        authStore.authOrganisation.name
      })`,
    },
  };
});


//Watch
watch(()=>props.orgaIdSelected, () => {
  if (!props.orgaIdSelected) {
    organisationChosen.value = getDefaultOrganisation.value;
    return;
  }
  if (
    props.orgaIdSelected &&
    organisationChosen.value?.id !== props.orgaIdSelected
  ) {
    fetchOrganisation();
  }
}, {immediate: true});
watch(()=>props.reset, () => {
  organisationChosen.value = getDefaultOrganisation.value;
});

onBeforeMount(()=>organisationChosen.value = getDefaultOrganisation.value)


//Methods
async function onSearchOrganisation(query?: string): Promise<void> {
  const response = await classicApi.fetchData<
    ListClassicReturn<Organisation>
  >({
    api: 0,
    path: "organisation/search",
    parameters: {
      query: query,
      first: 0,
      size: maxElement.value,
    },
  });
  let notNullOrga = response.result.filter((o: Organisation | null) => {
    return null !== o;
  });
  if (getDefaultOrganisation.value) {
    notNullOrga.unshift(getDefaultOrganisation.value);
  }
  if (myOrganisation.value) {
    if (undefined === query) {
      notNullOrga = notNullOrga.filter((obj: Organisation) => {
        return obj.id !== authStore.authOrgaId;
      });
      notNullOrga.splice(1, 0, myOrganisation.value);
    } else {
      const foundIndex = notNullOrga.findIndex(
        (obj: Organisation) => obj.id === authStore.authOrgaId,
      );
      if (foundIndex) {
        notNullOrga[foundIndex] = myOrganisation.value;
      }
    }
  }
  (selectOrganisationRef?.value as InstanceType<typeof ClassicMultiselect>).afterSearch(notNullOrga, response.count);
}
async function fetchOrganisation(): Promise<void> {
  organisationChosen.value = await saveFetchStore.getOrgaData(
    props.orgaIdSelected ?? "",
  );
  initLoaded.value = true;
}
</script>
