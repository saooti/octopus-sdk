<template>
  <VueDatePicker
    :model-value="modelVal"
    :range="undefined !== range"
    :max-date="isMaxDate ? now : undefined"
    :min-date="isMinDate ? now : undefined"
    :multi-calendars="columnNumber>1 && !isTimePicker? columnNumber : false"
    :enable-time-picker="displayTimePicker && !isTimePicker"
    :time-picker="isTimePicker"
    :inline="columnNumber > 1"
    :enable-seconds="displaySeconds"
    :locale="formatLocale"
    :format="format"
    :auto-apply="true"
    :readonly="readonly"
    :teleport="useTeleport"
    :clearable="false"
    :time-picker-inline="!isTimePicker ? true : false"
    :input-class-name="templateClass"
    @update:model-value="$emit('updateDate', $event)"
  />
</template>

<script lang="ts">
import dayjs from "dayjs";
import VueDatePicker from '@vuepic/vue-datepicker';
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    VueDatePicker,
  },
  props: {
    time: { default:undefined, type: Object as () => {hours:number, minutes:number, seconds:number} },
    date: { default: undefined, type: Date },
    range: {default: undefined,type: Array as () => Array<Date>},
    isMaxDate: { default: false, type: Boolean },
    isMinDate: { default: false, type: Boolean },
    columnNumber: { default: 1, type: Number },
    displaySeconds: { default: false, type: Boolean },
    displayTimePicker:{ default: true, type: Boolean },
    isTimePicker:{ default: false, type: Boolean },
    useTeleport:{ default: false, type: Boolean },
    templateClass: { default: undefined, type: String },
    readonly: { default: false, type: Boolean },
  },

  emits: ["updateDate", "update:date"],
  data() {
    return {
    };
  },
  computed: {
    modelVal(){
      return this.time ?? this.range ?? this.date;
    },
    formatLocale(){
      return this.$i18n.locale;
    },
    format(){
      let timeString = '';
      if(this.displayTimePicker || this.isTimePicker){
        timeString ='HH:mm';
        if(this.displaySeconds){
          timeString ='HH:mm:ss';
        } 
      }
      const dayString = this.isTimePicker ? timeString : 'dd/MM/yyyy '+timeString;
      return this.range ? dayString+' - '+dayString : dayString;
    },
    now(): Date {
      return dayjs().toDate();
    },
  },
});
</script>
<style lang="scss">
@import '@vuepic/vue-datepicker/dist/main.css';
.dp__theme_light {
   --dp-primary-color: #1a8658;
   --dp-time-font-size: 1rem;
}
</style>
