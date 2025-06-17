<template>
  <section class="module-box">
    <h2 class="mb-3">
      {{ t("Program") }}
    </h2>
    <div class="py-3">
      <div class="d-flex align-items-center w-100 mb-3">
        <button
          v-for="day in displayArrayDays"
          :key="day.date"
          class="button-date border"
          :class="day.date == daySelected ? 'bg-primary' : ''"
          @click="changeDate(day.date)"
        >
          <span class="text-capitalize" >{{ day.dayOfWeek }}</span>
          <time :datetime="day.iso">{{ day.title }}</time>
        </button>
      </div>
      <button v-if="isPhone" class="btn btn-primary mb-3 mx-0" @click="showAllDays = !showAllDays">
        <template v-if="!showAllDays">{{ t('Show more days') }}</template>
        <template v-else>{{ t('Show fewer days') }}</template>
      </button>
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
          {{ t("Now") }}
        </button>
      </div>

      <div class="d-flex flex-column p-3">
        <ClassicLoading
          :loading-text="loading ? t('Loading content ...') : undefined"
          :error-text="error ? t(`Error`) : undefined"
        />
        <template v-if="!loading && !error">
          <div v-if="!planningLength[daySelected]" class="text-center">
            {{ t("No programming") }}
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
                <time :datetime="planningItem.startDate" class="program-item-date fw-bold flex-shrink-0">
                  {{ dateDisplay(planningItem.startDate) }}
                </time>
                <router-link
                  class="d-flex align-items-center flex-nowrap text-dark"
                  :to="{
                    name: 'podcast',
                    params: { podcastId: planningItem.podcastId },
                  }"
                  :title="t('Episode name page', { name: planningItem.title })"
                >
                  <img
                    v-lazy="
                      useProxyImageUrl(planningItem.podcastData.imageUrl, '150')
                    "
                    width="150"
                    height="150"
                    class="m-2 program-item-img"
                    aria-hidden="true"
        alt=""
                    
                    :title="
                      t('Episode name image', {
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
                        {{ t("Live") }}
                      </div>
                      <div class="flex-grow-1 fw-bold">
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
  </section>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import classicApi from "../../../api/classicApi";
import {useImageProxy} from "../../composable/useImageProxy";
import {useResizePhone} from "../../composable/useResizePhone";
import ClassicLoading from "../../form/ClassicLoading.vue";
import { computed, nextTick, onMounted, ref, Ref } from "vue";
import { Canal } from "@/stores/class/radio/canal";
import { PlanningOccurrence } from "@/stores/class/radio/recurrence";
import { PlanningLive } from "@/stores/class/radio/live";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  radio: { default: undefined, type: Object as () => Canal },
})

//Data 
const planning: Ref<{
  [key: number]: {
    morning: Array<PlanningOccurrence | PlanningLive>;
    afternoon: Array<PlanningOccurrence | PlanningLive>;
    evening: Array<PlanningOccurrence | PlanningLive>;
  };
}> = ref({});
const planningLength: Ref<{ [key: number]: number }> = ref({});
const daySelected = ref(dayjs().valueOf());
const arrayDays: Ref<Array<{
  title: string;
  date: number;
  dayOfWeek: string;
  iso: string;
}>> = ref([]);
const loading = ref(true);
const error = ref(false);
const showAllDays = ref(false);


//Composables
const { t } = useI18n();
const { isPhone } = useResizePhone();
const { useProxyImageUrl } = useImageProxy();

//Computed
const startOfDay = computed(() => dayjs(daySelected.value).startOf("date").toISOString());
const endOfDay = computed(() => dayjs(daySelected.value).endOf("date").toISOString());
const periodOfDay = computed(() => {
  return [
    {
      id: "morning",
      title: t("Morning"),
      end: dayjs(daySelected.value)
        .hour(14)
        .minute(0)
        .second(0)
        .millisecond(0),
    },
    {
      id: "afternoon",
      title: t("Afternoon"),
      end: dayjs(daySelected.value)
        .hour(19)
        .minute(0)
        .second(0)
        .millisecond(0),
    },
    {
      id: "evening",
      title: t("Evening"),
      end: dayjs(daySelected.value).endOf("date"),
    },
  ];
});
const displayArrayDays = computed(() => {
  if(isPhone && !showAllDays.value){
    return arrayDays.value.slice(6, 9);
  }
  return arrayDays.value;
});


onMounted(()=>{
  createArrayDays();
  fetchOccurrences();
})


//Mounted
function scrollToElement(id: string) {
  const element = document.getElementById(id);
  if (element) {
    const yOffset = -110;
    const y =
      element.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}
function changePeriodNow() {
  const now = dayjs();
  if (!dayjs(daySelected.value).isSame(now, "day")) {
    changeDate(arrayDays.value[7].date);
  }
  nextTick(() => {
    if (!planningLength.value[daySelected.value]) {
      return;
    }
    const arrayOccurrences = Object.values(
      planning.value[daySelected.value],
    ).reduce((r, c) => r.concat(c), []);
    let selectedOccurrence = arrayOccurrences[0];
    for (const occ of arrayOccurrences) {
      selectedOccurrence = occ;
      if (dayjs(occ.endDate).isAfter(now)) {
        break;
      }
    }
    scrollToElement(
      "planning-occurrence-" +
        selectedOccurrence.occurrenceId +
        "" +
        selectedOccurrence.liveId,
    );
  });
}
function createArrayDays() {
  for (let index = -7; index < 3; index++) {
    const dayToAdd = dayjs().add(index, "day");
    if (0 === index) {
      daySelected.value = dayToAdd.valueOf();
    }
    arrayDays.value.push({
      title: dayToAdd.format("D/MM"),
      dayOfWeek: dayToAdd.format("dddd"),
      date: dayToAdd.valueOf(),
      iso: dayToAdd.format("MM-DD"),
    });
  }
}
async function fetchOccurrencesAndLives(): Promise<
  Array<PlanningOccurrence | PlanningLive>
> {
  const params = {
    canalId: props.radio?.id,
    from:startOfDay.value,
    to:endOfDay.value,
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
}
async function fetchOccurrences(): Promise<void> {
  if (planning.value[daySelected.value]) {
    return;
  }
  planning.value[daySelected.value] = {
    morning: [],
    afternoon: [],
    evening: [],
  };
  planningLength.value[daySelected.value] = 0;
  loading.value = true;
  error.value = false;
  try {
    const occurrences = await fetchOccurrencesAndLives();
    let periodDayIndex = 0;
    for (const occ of occurrences) {
      if (!occ.podcastId) {
        continue;
      }
      if (
        !dayjs(occ.startDate).isBefore(periodOfDay.value[periodDayIndex].end)
      ) {
        periodDayIndex += 1;
      }
      switch (periodOfDay.value[periodDayIndex].id) {
        case "morning":
          planning.value[daySelected.value].morning.push(occ);
          break;
        case "afternoon":
          planning.value[daySelected.value].afternoon.push(occ);
          break;
        case "evening":
          planning.value[daySelected.value].evening.push(occ);
          break;
        default:
          break;
      }
      planningLength.value[daySelected.value] += 1;
    }
  } catch {
    error.value = true;
  }
  loading.value = false;
}
function changeDate(date: number) {
  daySelected.value = date;
  fetchOccurrences();
}
function dateDisplay(date: Date): string {
  return dayjs(date).format("HH:mm");
}
</script>
<style lang="scss">
.octopus-app {
  .program-item-date {
    width: 100px;
    font-size: 1.1rem;

    @media (width <= 960px) {
			font-size: 0.8rem;
		}
  }

  .program-item-img{
    @media (width <= 960px) {
			width: 80px;
      height: 80px;
      margin: 0.5rem 0.5rem 0 0 !important;
		}
  }

  .button-date {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
    padding: 0.5rem;

    &.bg-primary{
      color: var(--octopus-color-on-primary) !important;
    }

    &:hover {
      background: var(--octopus-secondary);
    }

    @media (width <= 960px) {
			width: 80px;
		}
  }
}
</style>
