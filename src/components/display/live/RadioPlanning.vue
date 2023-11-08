<template>
  <div class="module-box">
    <h2 class="big-h2 mb-3 height-40">
      {{ $t("Program") }}
    </h2>
    <div class="py-3">
      <div class="d-flex align-items-center w-100">
        <button
          v-for="day in arrayDays"
          :key="day.date"
          class="d-flex flex-column align-items-center flex-grow-1 button-date"
          :class="day.date == daySelected ? 'bg-primary text-white' : ''"
          @click="changeDate(day.date)"
        >
          <span class="text-capitalize">{{ day.dayOfWeek }}</span>
          <span>{{ day.title }}</span>
        </button>
      </div>
      <div class="d-flex flex-column p-3">
        <ClassicLoading
          :loading-text="loading ? $t('Loading content ...') : undefined"
          :error-text="error ? $t(`Error`) : undefined"
        />
        <template v-if="!loading && !error">
          <div v-if="!planning[daySelected].length" class="text-center">
            {{ $t("No programming") }}
          </div>
          <div
            v-for="planningItem in planning[daySelected]"
            v-else
            :key="
              planningItem.occurrence.occurrenceId +
              '' +
              planningItem.occurrence.liveId
            "
            class="d-flex align-items-center mb-3"
          >
            <div class="program-item-date fw-bold flex-shrink-0">
              {{ dateDisplay(planningItem.occurrence.startDate) }}
            </div>
            <component
              :is="
                planningItem.podcast.availability.visibility
                  ? 'router-link'
                  : 'div'
              "
              class="d-flex align-items-center text-dark"
              :to="{
                name: 'podcast',
                params: { podcastId: planningItem.podcast.podcastId },
                query: { productor: filterOrgaId },
              }"
            >
              <img
                v-lazy="proxyImageUrl(planningItem.podcast.imageUrl, '150')"
                width="150"
                height="150"
                class="m-2"
                :title="
                  $t('Episode name image', { name: planningItem.podcast.title })
                "
                :alt="
                  $t('Episode name image', { name: planningItem.podcast.title })
                "
              />
              <div class="d-flex flex-column">
                <div class="d-flex align-items-center mb-2">
                  <div
                    v-if="planningItem.occurrence.liveId"
                    class="bg-complementary text-white p-1 me-1"
                  >
                    {{ $t("Live") }}
                  </div>
                  <div class="flex-grow-1 text-truncate fw-bold">
                    {{ planningItem.occurrence.podcastData.title }}
                  </div>
                </div>

                <ParticipantDescription
                  :participants="planningItem.podcast.animators"
                />
              </div>
            </component>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useFilterStore } from "@/stores/FilterStore";
import { mapState } from "pinia";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import octopusApi from "@saooti/octopus-api";
import imageProxy from "../../mixins/imageProxy";
import ParticipantDescription from "../podcasts/ParticipantDescription.vue";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { defineComponent } from "vue";
import { Canal } from "@/stores/class/radio/canal";
import { PlanningOccurrence } from "@/stores/class/radio/recurrence";
import { Podcast } from "@/stores/class/general/podcast";
import { PlanningLive } from "@/stores/class/radio/live";
export default defineComponent({
  name: "RadioPlanning",

  components: {
    ClassicLoading,
    ParticipantDescription,
  },

  mixins: [imageProxy],

  props: {
    radio: { default: undefined, type: Object as () => Canal },
  },

  data() {
    return {
      planning: {} as {
        [key: number]: Array<{
          podcast: Podcast;
          occurrence: PlanningOccurrence | PlanningLive;
        }>;
      },
      daySelected: dayjs().valueOf(),
      arrayDays: [] as Array<{
        title: string;
        date: number;
        dayOfWeek: string;
      }>,
      loading: true as boolean,
      error: false as boolean,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    startOfDay(): string {
      return dayjs(this.daySelected).utcOffset(0).startOf("date").toISOString();
    },
    endOfDay(): string {
      return dayjs(this.daySelected).utcOffset(0).endOf("date").toISOString();
    },
  },

  mounted() {
    this.createArrayDays();
    this.fetchOccurrences();
  },

  methods: {
    createArrayDays() {
      for (let index = -7; index < 3; index++) {
        const dayToAdd = dayjs().add(index, "day");
        if (0 === index) {
          this.daySelected = dayToAdd.valueOf();
        }
        this.arrayDays.push({
          title: dayToAdd.format("D/MM"),
          dayOfWeek: dayToAdd.format("dddd"),
          date: dayToAdd.valueOf(),
        });
      }
    },
    async fetchOccurrences(): Promise<void> {
      if (this.planning[this.daySelected]) {
        return;
      }
      this.loading = true;
      this.error = false;
      try {
        const params = {
          canalId: this.radio?.id,
          from: this.startOfDay,
          to: this.endOfDay,
        };
        let occurrences: Array<PlanningOccurrence | PlanningLive> =
          await octopusApi.fetchDataWithParams<Array<PlanningOccurrence>>(
            14,
            "planning/occurrence/list",
            params,
          );
        const lives = await octopusApi.fetchDataWithParams<
          Array<PlanningOccurrence>
        >(14, "live/list", params);
        if (lives.length) {
          occurrences = occurrences.concat(lives);
          occurrences.sort((a, b) => {
            if (a.startDate > b.startDate) {
              return 1;
            }
            return b.startDate > a.startDate ? -1 : 0;
          });
        }
        this.planning[this.daySelected] = [];
        for (let oc of occurrences) {
          if (oc.podcastId) {
            const data: Podcast = await octopusApi.fetchData<Podcast>(
              0,
              "podcast/" + oc.podcastId,
            );
            this.planning[this.daySelected].push({
              podcast: data,
              occurrence: oc,
            });
          }
        }
      } catch {
        this.error = true;
      }
      this.loading = false;
    },
    changeDate(date: number) {
      this.daySelected = date;
      this.fetchOccurrences();
    },
    dateDisplay(date: Date): string {
      return dayjs(date).format("HH:mm:ss");
    },
  },
});
</script>
<style lang="scss">
.octopus-app {
  .program-item-date {
    width: 100px;
    font-size: 1.1rem;
  }
  .button-date{
    border: 1px solid #ddd;
    padding: 0.5rem 0;
    &:hover{
      background: #ddd;
    }
  }
}
</style>
