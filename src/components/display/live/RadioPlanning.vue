<template>
  <div class="module-box">
    <h2 class="mb-3">
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
      <div
        class="d-flex align-items-center justify-content-center border-bottom"
      >
        <button
          v-for="period in periodOfDay"
          :key="period.id"
          class="btn btn-underline mb-2"
          @click="scrollToElement('planning-period-' + period.id)"
        >
          {{ period.title }}
        </button>
        <button class="btn btn-underline mb-2" @click="changePeriodNow">
          {{ $t("Now") }}
        </button>
      </div>

      <div class="d-flex flex-column p-3">
        <ClassicLoading
          :loading-text="loading ? $t('Loading content ...') : undefined"
          :error-text="error ? $t(`Error`) : undefined"
        />
        <template v-if="!loading && !error">
          <div v-if="!planningLength[daySelected]" class="text-center">
            {{ $t("No programming") }}
          </div>
          <div v-for="period in periodOfDay" v-else :key="period.id">
            <template v-if="planning[daySelected][period.id].length">
              <div
                :id="'planning-period-' + period.id"
                class="fw-bold my-3 pb-2 border-bottom border-primary text-primary"
              >
                {{ period.title }}
              </div>
              <div
                v-for="planningItem in planning[daySelected][period.id]"
                :id="
                  'planning-occurrence-' +
                  planningItem.occurrenceId +
                  '' +
                  planningItem.liveId
                "
                :key="planningItem.occurrenceId + '' + planningItem.liveId"
                class="d-flex align-items-center mb-3"
              >
                <div class="program-item-date fw-bold flex-shrink-0">
                  {{ dateDisplay(planningItem.startDate) }}
                </div>
                <router-link
                  class="d-flex align-items-center text-dark"
                  :to="{
                    name: 'podcast',
                    params: { podcastId: planningItem.podcastId },
                    query: { productor: filterOrgaId },
                  }"
                >
                  <img
                    v-lazy="
                      proxyImageUrl(planningItem.podcastData.imageUrl, '150')
                    "
                    width="150"
                    height="150"
                    class="m-2"
                    :title="
                      $t('Episode name image', {
                        name: planningItem.podcastData.title,
                      })
                    "
                    :alt="
                      $t('Episode name image', {
                        name: planningItem.podcastData.title,
                      })
                    "
                  />
                  <div class="d-flex flex-column">
                    <div class="d-flex align-items-center mb-2">
                      <div
                        v-if="planningItem.liveId"
                        class="bg-complementary text-white p-1 me-1"
                      >
                        {{ $t("Live") }}
                      </div>
                      <div class="flex-grow-1 text-truncate fw-bold">
                        {{ planningItem.podcastData.title }}
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useFilterStore } from "../../../stores/FilterStore";
import { mapState } from "pinia";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import classicApi from "../../../api/classicApi";
import imageProxy from "../../mixins/imageProxy";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { defineComponent } from "vue";
import { Canal } from "@/stores/class/radio/canal";
import { PlanningOccurrence } from "@/stores/class/radio/recurrence";
import { PlanningLive } from "@/stores/class/radio/live";
export default defineComponent({
  name: "RadioPlanning",

  components: {
    ClassicLoading,
  },

  mixins: [imageProxy],

  props: {
    radio: { default: undefined, type: Object as () => Canal },
  },

  data() {
    return {
      planning: {} as {
        [key: number]: {
          morning: Array<PlanningOccurrence | PlanningLive>;
          afternoon: Array<PlanningOccurrence | PlanningLive>;
          evening: Array<PlanningOccurrence | PlanningLive>;
        };
      },
      planningLength: {} as { [key: number]: number },
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
      return dayjs(this.daySelected).startOf("date").toISOString();
    },
    endOfDay(): string {
      return dayjs(this.daySelected).endOf("date").toISOString();
    },
    periodOfDay() {
      return [
        {
          id: "morning",
          title: this.$t("Morning"),
          end: dayjs(this.daySelected)
            .hour(14)
            .minute(0)
            .second(0)
            .millisecond(0),
        },
        {
          id: "afternoon",
          title: this.$t("Afternoon"),
          end: dayjs(this.daySelected)
            .hour(19)
            .minute(0)
            .second(0)
            .millisecond(0),
        },
        {
          id: "evening",
          title: this.$t("Evening"),
          end: dayjs(this.daySelected).endOf("date"),
        },
      ];
    },
  },

  mounted() {
    this.createArrayDays();
    this.fetchOccurrences();
  },

  methods: {
    scrollToElement(id: string) {
      const element = document.getElementById(id);
      if (element) {
        const yOffset = -110;
        const y =
          element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    },
    changePeriodNow() {
      const now = dayjs();
      if (!dayjs(this.daySelected).isSame(now, "day")) {
        this.changeDate(this.arrayDays[7].date);
      }
      this.$nextTick(() => {
        if (!this.planningLength[this.daySelected]) {
          return;
        }
        const arrayOccurrences = Object.values(
          this.planning[this.daySelected],
        ).reduce((r, c) => r.concat(c), []);
        let selectedOccurrence = arrayOccurrences[0];
        for (let occ of arrayOccurrences) {
          selectedOccurrence = occ;
          if (dayjs(occ.endDate).isAfter(now)) {
            break;
          }
        }
        this.scrollToElement(
          "planning-occurrence-" +
            selectedOccurrence.occurrenceId +
            "" +
            selectedOccurrence.liveId,
        );
      });
    },
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
    async fetchOccurrencesAndLives(): Promise<
      Array<PlanningOccurrence | PlanningLive>
    > {
      const params = {
        canalId: this.radio?.id,
        from: this.startOfDay,
        to: this.endOfDay,
      };
      let occurrences: Array<PlanningOccurrence | PlanningLive> =
        await classicApi.fetchData<Array<PlanningOccurrence>>({
          api: 14,
          path: "planning/occurrence/list",
          parameters: params,
        });
      const lives: Array<PlanningOccurrence> = await classicApi.fetchData<
        Array<PlanningOccurrence>
      >({
        api: 14,
        path: "live/list",
        parameters: params,
      });
      if (lives.length) {
        occurrences = occurrences.concat(lives);
        occurrences.sort((a, b) => {
          if (a.startDate > b.startDate) {
            return 1;
          }
          return b.startDate > a.startDate ? -1 : 0;
        });
      }
      return occurrences;
    },
    async fetchOccurrences(): Promise<void> {
      if (this.planning[this.daySelected]) {
        return;
      }
      this.planning[this.daySelected] = {
        morning: [],
        afternoon: [],
        evening: [],
      };
      this.planningLength[this.daySelected] = 0;
      this.loading = true;
      this.error = false;
      try {
        let occurrences = await this.fetchOccurrencesAndLives();
        let periodDayIndex = 0;
        for (let occ of occurrences) {
          if (!occ.podcastId) {
            continue;
          }
          if (
            !dayjs(occ.startDate).isBefore(this.periodOfDay[periodDayIndex].end)
          ) {
            periodDayIndex += 1;
          }
          switch (this.periodOfDay[periodDayIndex].id) {
            case "morning":
              this.planning[this.daySelected].morning.push(occ);
              break;
            case "afternoon":
              this.planning[this.daySelected].afternoon.push(occ);
              break;
            case "evening":
              this.planning[this.daySelected].evening.push(occ);
              break;
            default:
              break;
          }
          this.planningLength[this.daySelected] += 1;
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
  .button-date {
    border: 1px solid #ddd;
    padding: 0.5rem 0;
    &:hover {
      background: #ddd;
    }
  }
}
</style>
