<template>
  <section
    v-if="(filterStore.filterOrgaId || organisationId) && radio.length"
    class="d-flex flex-column align-items-start mt-3"
  >
    <h2 class="mb-0 mb-3">
      {{ t("Radio") }}
    </h2>
    <template v-if="radio.length">
      <RadioItem
        v-for="radioItem in radio"
        :key="radioItem.id"
        :radio="radioItem"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import RadioItem from "./RadioItem.vue";
import {useErrorHandler} from "../../composable/useErrorHandler";
import classicApi from "../../../api/classicApi";
import { useFilterStore } from "../../../stores/FilterStore";
import { Canal } from "@/stores/class/radio/canal";
import { computed, Ref, ref, watch } from "vue";
import { AxiosError } from "axios";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  organisationId: { default: undefined, type: String },
})

//Data 
const radio: Ref<Array<Canal>> = ref([]);

//Composables
const { t } = useI18n();
const {handle403} = useErrorHandler();
const filterStore = useFilterStore();

//Computed
const filterOrgaUsed = computed(() => filterStore.filterOrgaId ? filterStore.filterOrgaId : props.organisationId);

//Watch
watch(filterOrgaUsed, () =>fetchContent(), {immediate: true});

//Methods
async function fetchContent(): Promise<void> {
  radio.value.length = 0;
  if (!filterOrgaUsed.value) {
    return;
  }
  try {
    radio.value = await classicApi.fetchData<Array<Canal>>({
      api: 14,
      path: "canal/orga/" + filterOrgaUsed.value + "/",
    });
  } catch (error) {
    handle403(error as AxiosError);
  }
}
</script>
