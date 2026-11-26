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
                    <span class="text-capitalize">{{ day.dayOfWeek }}</span>
                    <time :datetime="day.iso">{{ day.title }}</time>
                </button>
            </div>
            <button
                v-if="isPhone"
                class="btn btn-primary mb-3 mx-0"
                @click="showAllDays = !showAllDays"
            >
                <template v-if="!showAllDays">
                    {{ t('Show more days') }}
                </template>
                <template v-else>
                    {{ t('Show fewer days') }}
                </template>
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
                    <div
                        v-for="period in periodOfDay"
                        v-else
                        :key="period.id"
                    >
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
                                        :title="t('Episode name image', { name: planningItem.podcastData.title })"
                                    >
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
import dayjs, { Dayjs } from "dayjs";
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
const periodOfDay = computed(() => {
    return [{
        id: "morning",
        title: t("Morning"),
        end: dayjs(daySelected.value)
            .hour(14)
            .minute(0)
            .second(0)
            .millisecond(0),
    }, {
        id: "afternoon",
        title: t("Afternoon"),
        end: dayjs(daySelected.value)
            .hour(19)
            .minute(0)
            .second(0)
            .millisecond(0),
    }, {
        id: "evening",
        title: t("Evening"),
        end: dayjs(daySelected.value).endOf("date"),
    }];
});

const displayArrayDays = computed(() => {
    if(isPhone.value && !showAllDays.value){
        return arrayDays.value.slice(6, 9);
    }
    return arrayDays.value;
});

onMounted(()=>{
    createArrayDays();
    fetchOccurrences();
});

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

function getPeriod(): [Dayjs, Dayjs] {
    const start = dayjs().startOf("week");
    const end = dayjs().add(2, 'weeks').startOf("week");

    return [start, end];
}

function createArrayDays() {
    // Display this week, plus the next
    const[start, end] = getPeriod();
    let current = start;

    daySelected.value = dayjs().startOf('day').valueOf();

    while (current.isBefore(end)) {
        arrayDays.value.push({
            title: current.format("D/MM"),
            dayOfWeek: current.format("dddd"),
            date: current.valueOf(),
            iso: current.format("MM-DD"),
        });

        current = current.add(1, 'day');
    }
}

async function fetchOccurrencesAndLives(): Promise<Array<PlanningOccurrence|PlanningLive>> {
    const [start, end] = getPeriod();
    const from = start.toISOString();
    const to = end.toISOString();

    const params = {
        canalId: props.radio?.id,
        from,
        to,
    };

    const occurrencesPromise = classicApi.fetchData<Array<PlanningOccurrence>>({
        api: 14,
        path: "planning/occurrence/list",
        parameters: params
    });

    const livesPromise = classicApi.fetchData<Array<PlanningOccurrence>>({
        api: 14,
        path: "live/list",
        parameters: params
    });

    const [occurrences, lives] = await Promise.all([
        occurrencesPromise,
        livesPromise
    ]);

    if (!lives.length) {
        return occurrences;
    }

    const all = occurrences.concat(lives);
    return all.sort((a, b) => {
        if (a.startDate > b.startDate) {
            return 1;
        }
        return b.startDate > a.startDate ? -1 : 0;
    });
}

async function fetchOccurrences(): Promise<void> {
    planning.value = [];
    planningLength.value = [];
    loading.value = true;
    error.value = false;

    try {
        const occurrences = await fetchOccurrencesAndLives();
        let periodDayIndex = 0;
        for (const occ of occurrences) {
            // Ignore occurrences with no podcast
            if (!occ.podcastId) {
                continue;
            }

            // Find period of day
            if (!dayjs(occ.startDate).isBefore(periodOfDay.value[periodDayIndex].end)) {
                periodDayIndex += 1;

                if (periodDayIndex >= periodOfDay.value.length) {
                    periodDayIndex = 0;
                }
            }

            // Find day
            const day = dayjs(occ.startDate).startOf('day').valueOf();
            if (!(day in planning.value)) {
                planning.value[day] = {
                    morning: [],
                    afternoon: [],
                    evening: []
                }
            }
            if (!(day in planningLength.value)) {
                planningLength.value[day] = 0;
            }

            switch (periodOfDay.value[periodDayIndex].id) {
            case "morning":
                planning.value[day].morning.push(occ);
                break;
            case "afternoon":
                planning.value[day].afternoon.push(occ);
                break;
            case "evening":
                planning.value[day].evening.push(occ);
                break;
            default:
                break;
            }
            planningLength.value[day] += 1;
        }
    } catch(e) {
        error.value = true;
        console.error(e);
    }
    loading.value = false;
}

function changeDate(date: number) {
    daySelected.value = date;
    //fetchOccurrences();
}

function dateDisplay(date: Date): string {
    return dayjs(date).format("HH:mm");
}
</script>

<style scoped lang="scss">
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
</style>
