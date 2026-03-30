<template>
  <div class="d-flex flex-column p-3 list-participants">
    <h2 class="mb-3">{{ title }}</h2>
    <ClassicLoading
      :loading-text="loading ? t('Loading participants ...') : undefined"
    />
    <SwiperList
      v-if="!loading && allParticipants.length"
      :size-item-overload="itemSize"
      :list-object="allParticipants"
    >
      <template #octopusSlide="{ option }">
        <ParticipantItem
          v-if="0 !== option.participantId" 
          :participant="option"
        />
      </template>
    </SwiperList>

    <router-link
      v-if="buttonText"
      :to="href ?? { name: 'participants' }"
      class="btn btn-primary align-self-center w-fit-content m-4"
    >
      {{ buttonText }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import ParticipantItem from "./ParticipantItem.vue";
import SwiperList from "../list/SwiperList.vue";
import classicApi from "../../../api/classicApi";
import {useErrorHandler} from "../../composable/useErrorHandler";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { onMounted, Ref, ref } from "vue";
import { AxiosError } from "axios";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
import { Participant } from "@/stores/class/general/participant";
import { useI18n } from "vue-i18n";


//Props 
const props = defineProps({
  organisationId: { default: undefined, type: String },
  href: { default: undefined, type: String },
  buttonText: { default: undefined, type: String },
  itemSize: { default: undefined, type: Number },
  title: { default: "", type: String },
})

//Data 
const loading = ref(true);
const allParticipants: Ref<Array<Participant>> = ref([]);
  
//Composables
const { t } = useI18n();
const { handle403 } = useErrorHandler();

onMounted(()=>fetchNext())

//Methods
async function fetchNext(): Promise<void> {
  try {
    const data = await classicApi.fetchData<ListClassicReturn<Participant>>({
      api: 0,
      path: "participant/search",
      parameters: {
        first: 0,
        size: 12,
        organisationId: props.organisationId,
        order: "LAST_PODCAST_DESC",
      },
      specialTreatement: true,
    });
    allParticipants.value = allParticipants.value.concat(
      data.result.filter((part: Participant | null) => null !== part),
    );
    loading.value = false;
  } catch (error) {
    handle403(error as AxiosError);
  }
}
</script>

<style scoped lang="scss">
.list-participants{
  .element-list-inline{
      @media (width <= 960px) {
      > div{
        margin: 0 0.5rem 0 0;
      }
    }
  }

  .participant-item-container{
    margin:0;
  }
}
</style>
