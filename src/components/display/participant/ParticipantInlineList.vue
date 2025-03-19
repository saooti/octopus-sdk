<template>
  <div class="d-flex flex-column p-3 list-participants">
    <h2 class="mb-3">{{ title }}</h2>
    <ClassicLoading
      :loading-text="loading ? $t('Loading participants ...') : undefined"
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
      :to="href"
      class="btn btn-primary align-self-center w-fit-content m-4"
    >
      {{ buttonText }}
    </router-link>
  </div>
</template>

<script lang="ts">
import ParticipantItem from "./ParticipantItem.vue";
import SwiperList from "../list/SwiperList.vue";
import classicApi from "../../../api/classicApi";
import {useErrorHandler} from "../../composable/useErrorHandler";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { defineComponent } from "vue";
import { AxiosError } from "axios";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
import { Participant } from "@/stores/class/general/participant";
export default defineComponent({
  name: "ParticipantInlineList",

  components: {
    ParticipantItem,
    ClassicLoading,
    SwiperList,
  },

  props: {
    organisationId: { default: undefined, type: String },
    href: { default: undefined, type: String },
    buttonText: { default: undefined, type: String },
    itemSize: { default: undefined, type: Number },
    title: { default: "", type: String },
  },
  setup(){
    const {handle403} = useErrorHandler();
    return { handle403 }
  },

  data() {
    return {
      loading: true as boolean,
      allParticipants: [] as Array<Participant>,
    };
  },

  mounted() {
    this.fetchNext();
  },
  methods: {
    async fetchNext(): Promise<void> {
      try {
        const data = await classicApi.fetchData<ListClassicReturn<Participant>>({
          api: 0,
          path: "participant/search",
          parameters: {
            first: 0,
            size: 12,
            organisationId: this.organisationId,
            order: "LAST_PODCAST_DESC",
          },
          specialTreatement: true,
        });
        this.allParticipants = this.allParticipants.concat(
          data.result.filter((part: Participant | null) => null !== part),
        );
        this.loading = false;
      } catch (error) {
        this.handle403(error as AxiosError);
      }
    },

    reset(): void {
      this.loading = true;
      this.allParticipants.length = 0;
    },
  },
});
</script>
<style lang="scss">
.octopus-app {
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
}
</style>
