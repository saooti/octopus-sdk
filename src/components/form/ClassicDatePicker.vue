<template>
    <div ref="divContainer" tabindex="0">
        <label
            v-if="label && !range"
            class="form-label"
            :for="'dp-input-'+id"
            :class="displayLabel ? '' : 'd-none'"
        >
            {{ label }}
        </label>
        <VueDatePicker
            :model-value="modelVal"
            :time-picker="isTimePicker"
            :time-config="timeConfig"
            :ui="templateClass ? { input: templateClass } : {}"
            :input-attrs="{ clearable: false, id: 'dp-input-' + id }"
            :text-input="true"
            :readonly="readonly"
            :teleport="useTeleport"
            :locale="getLocale(locale)"
            :formats="{ input: format }"
            :auto-apply="true"
            :max-date="isMaxDate && !isTimePicker ? limit : undefined"
            :min-date="isMinDate && !isTimePicker ? limit : undefined"
            :range="undefined !== range"
            :multi-calendars="columnNumber > 1 ? columnNumber : false"
            :inline="isInline"
            :aria-labels="ariaLabels"
            :max-time="maxTime"
            :month-picker="monthPicker"
            @update:model-value="updateValue($event)"
        >
            <template v-if="isTimePicker" #input-icon>
                <ClockOutlineIcon :size="16" class="ms-2" />
            </template>
        </VueDatePicker>
    </div>
</template>

<script setup lang="ts">
import ClockOutlineIcon from "vue-material-design-icons/ClockOutline.vue";
import dayjs from "dayjs";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { getLocale } from "@/i18n";

//Props 
const props = defineProps({
    id:{ default: undefined, type: String },
    time: {
        default: undefined,
        type: Object as () => { hours: number; minutes: number; seconds: number },
    },
    date: { default: undefined, type: Date },
    range: { default: undefined, type: Array as () => Array<Date> },
    /**
     * Enable maximum date limit.
     * If `dateLimit` is not set, use current datetime.
     */
    isMaxDate: { default: false, type: Boolean },
    /** Date limit when `isMaxDate` or `isMinDate` are set */
    dateLimit: { default: undefined, type: Date },
    /**
     * Enable minimum date limit.
     * If `dateLimit` is not set, use current datetime.
     */
    isMinDate: { default: false, type: Boolean },
    columnNumber: { default: 1, type: Number },
    displaySeconds: { default: false, type: Boolean },
    displayTimePicker: { default: true, type: Boolean },
    isTimePicker: { default: false, type: Boolean },
    useTeleport: { default: false, type: Boolean },
    templateClass: { default: undefined, type: String },
    readonly: { default: false, type: Boolean },
    maxTime: {
        default: null,
        type: Object as () => {
            hours: number | string;
            minutes: number | string;
            seconds?: number | string;
        },
    },
    forceFormat: { default: undefined, type: String },
    monthPicker: { default: false, type: Boolean },
    /** @deprecated No longer supported since vue-datepicker v14 */
    customPosition: { default: null, type: Function },
    isInline: { default: false, type: Boolean },
    timePickerInline: { default: false, type: Boolean },
    label: { default: undefined, type: String },
    displayLabel: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits<{
    /**
   * Update the date
   * @param value The new date
   * @deprecated
   */
    (e: "updateDate", value: Date): void;
    /**
   * Update the date
   * @param value The new date
   */
    (e: "update:date", value: Date): void;
}>();

//Data
const divContainerRef = useTemplateRef('divContainer');

//Composables
const { locale } = useI18n();

//Computed
const ariaLabels = computed(() => {
    return {
        input: props.date ? formatDate(props.date) : undefined,
        day: (value: { value: Date }) => {
            return formatDate(value.value);
        },
    };
});
const modelVal = computed(() => {
    if (props.time) {
        return props.time;
    }
    if (props.range) {
        return props.range;
    }
    if (props.date && props.monthPicker) {
        return {
            month: props.date.getMonth(),
            year: props.date.getFullYear(),
        };
    }
    return props.date;
});
const format = computed(() => {
    if (props.forceFormat) {
        return props.forceFormat;
    }
    if (props.monthPicker) {
        return "MM/yyyy";
    }
    let timeString = "";
    if (props.displayTimePicker || props.isTimePicker) {
        timeString = "HH:mm";
        if (props.displaySeconds) {
            timeString = "HH:mm:ss";
        }
    }
    const dayString = props.isTimePicker
        ? timeString
        : "dd/MM/yyyy " + timeString;
    return props.range ? dayString + " - " + dayString : dayString;
});
const timeConfig = computed(() => {
    return {
        enableSeconds: props.displaySeconds,
        timePickerInline: props.isTimePicker && props.timePickerInline,
        ...(!props.isTimePicker && { enableTimePicker: props.displayTimePicker })
    };
});
const limit = computed(() => {
    if (props.dateLimit) {
        return props.dateLimit;
    }
    return dayjs().toDate();
});


//Methods
function updateValue(date: Date) {
    if (!props.isInline) {
        (divContainerRef?.value as HTMLElement)?.focus();
    }
    emit("updateDate", date);
    emit("update:date", date);
}

function formatDate(value: Date): string {
    const realMonth = value.getMonth() + 1;
    return (
        value.getDate() +
        "/" +
        (realMonth < 10 ? "0" : "") +
        realMonth +
        "/" +
        value.getFullYear()
    );
}
</script>
<style lang="scss">
@use "@vuepic/vue-datepicker/dist/main.css";

/* stylelint-disable-next-line */
.dp--theme-light {
  --dp-primary-color: var(--octopus-primary);
  --dp-time-font-size: 1rem;
}
</style>
