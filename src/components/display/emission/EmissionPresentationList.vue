<template>
  <ClassicLoading
    :loading-text="loading ? $t('Loading emissions ...') : undefined"
    :error-text="error ? $t(`Error`) : undefined"
  />
  <PresentationLayout
    v-if="!loading && !error"
    :title="title"
    :items="allEmissions"
    :route="href"
    :button-text="buttonText"
  >
    <template #item="{ item, first }">
      <EmissionItemPresentation
        :class="!isPhone && first ? 'me-3' : ''"
        :emission="item"
        :is-vertical="!isPhone && first"
        :is-description="isDescription"
      />
    </template>
  </PresentationLayout>
</template>

<script setup lang="ts">
import classicApi from "../../../api/classicApi";
import {useErrorHandler} from "../../composable/useErrorHandler";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { Emission } from "@/stores/class/general/emission";
import { defineAsyncComponent, onMounted, Ref, ref } from "vue";
import { AxiosError } from "axios";
import {useResizePhone} from "../../composable/useResizePhone";
import { ListClassicReturn } from "@/stores/class/general/listReturn";

import PresentationLayout from "../../layouts/PresentationLayout.vue"; 

const EmissionItemPresentation = defineAsyncComponent(
  () => import("./EmissionPresentationItem.vue"),
);

//Props 
const props = defineProps({
  organisationId: { default: undefined, type: String },
  title: { default: "", type: String },
  href: { default: undefined, type: String },
  buttonText: { default: undefined, type: String },
  isDescription: { default: false, type: Boolean },
  rubriquesId: { default: [], type: Array<number> },
})

//Data 
const loading = ref(true);
const error = ref(false);
const allEmissions: Ref<Array<Emission>> = ref([]);
  
//Composables
const { isPhone } = useResizePhone();
const {handle403} = useErrorHandler();

onMounted(()=>fetchNext())


//Methods
async function fetchNext(): Promise<void> {
  loading.value = true;
  try {
    const data = await classicApi.fetchData<ListClassicReturn<Emission>>({
      api: 0,
      path: "emission/search",
      parameters: {
        first: 0,
        size: 5,
        organisationId: props.organisationId,
        sort: "LAST_PODCAST_DESC",
        rubriqueId: props.rubriquesId
      },
      specialTreatement: true,
    });
    allEmissions.value = allEmissions.value.concat(
      data.result.filter((em: Emission | null) => null !== em),
    );
    loading.value = false;
  } catch (errorWs) {
    handle403(errorWs as AxiosError);
    error.value = true;
  }
  loading.value = false;
}
</script>
