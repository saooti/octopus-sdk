<template>
  <div ref="divContainer" tabindex="0">
  <VueDatePicker
    :model-value="modelVal"
    :time-picker="isTimePicker"
    :input-class-name="templateClass"
    :clearable="false"
    :text-input="true"
    :readonly="readonly"
    :teleport="useTeleport"
    :locale="formatLocale"
    :format="format"
    :auto-apply="true"
    :enable-seconds="displaySeconds"
    :max-date="isMaxDate && !isTimePicker ? now : undefined"
    :min-date="isMinDate && !isTimePicker ? now : undefined"
    :range="undefined !== range"
    :multi-calendars="columnNumber > 1 ? columnNumber : false"
    :inline="isInline"
    :enable-time-picker="!isTimePicker ? displayTimePicker : undefined"
    :aria-labels="ariaLabels"
    :max-time="maxTime"
    :month-picker="monthPicker"
    :alt-position="customPosition"
    @update:model-value="updateValue($event)"
  >
    <template v-if="time" #input-icon>
      <div class="ms-2 saooti-clock" />
    </template>
  </VueDatePicker>
  </div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import VueDatePicker from "@vuepic/vue-datepicker";
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    VueDatePicker,
  },
  props: {
    time: {
      default: undefined,
      type: Object as () => { hours: number; minutes: number; seconds: number },
    },
    date: { default: undefined, type: Date },
    range: { default: undefined, type: Array as () => Array<Date> },
    isMaxDate: { default: false, type: Boolean },
    dateLimit: { default: undefined, type: Date },
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
        hours?: number | string;
        minutes?: number | string;
        seconds?: number | string;
      },
    },
    forceFormat: { default: undefined, type: String },
    monthPicker: { default: false, type: Boolean },
    customPosition: { default: null, type: Function },
    isInline: { default: false, type: Boolean },
  },

  emits: ["updateDate", "update:date"],
  data() {
    return {};
  },
  computed: {
    ariaLabels() {
      return {
        input: this.date ? this.formatDate(this.date) : undefined,
        day: (value: { value: Date }) => {
          return this.formatDate(value.value);
        },
      };
    },
    modelVal() {
      if (this.time) {
        return this.time;
      }
      if (this.range) {
        return this.range;
      }
      if (this.date && this.monthPicker) {
        return {
          month: this.date.getMonth(),
          year: this.date.getFullYear(),
        };
      }
      return this.date;
    },
    formatLocale() {
      return this.$i18n.locale;
    },
    format() {
      if(this.forceFormat){
        return this.forceFormat;
      }
      if (this.monthPicker) {
        return "MM/yyyy";
      }
      let timeString = "";
      if (this.displayTimePicker || this.isTimePicker) {
        timeString = "HH:mm";
        if (this.displaySeconds) {
          timeString = "HH:mm:ss";
        }
      }
      const dayString = this.isTimePicker
        ? timeString
        : "dd/MM/yyyy " + timeString;
      return this.range ? dayString + " - " + dayString : dayString;
    },
    now(): Date {
      if (this.dateLimit) {
        return this.dateLimit;
      }
      return dayjs().toDate();
    },
  },
  methods: {
    updateValue(date: Date){
      if(!this.isInline){
        this.$refs.divContainer?.focus();
      }
      this.$emit('updateDate', date);
    },
    formatDate(value: Date): string {
      const realMonth = value.getMonth() + 1;
      return (
        value.getDate() +
        "/" +
        (realMonth < 10 ? "0" : "") +
        realMonth +
        "/" +
        value.getFullYear()
      );
    },
  },
});
</script>
<style lang="scss">
@import "@vuepic/vue-datepicker/dist/main.css";
.dp__theme_light {
  --dp-primary-color: #1a8658;
  --dp-time-font-size: 1rem;
}
</style>
