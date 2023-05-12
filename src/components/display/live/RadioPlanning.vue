<template>
  <div class="module-box">
    <h2 class="big-h2 mb-3 height-40">{{ $t('Program') }}</h2>
    <div class="d-flex align-items-center w-100">
      {{daySelected}}
      <button
        v-for="day in arrayDays"
        :key="day.date"
        class="d-flex flex-column align-items-center flex-grow-1"
        :class="day.date==daySelected?'light-primary-bg':''"
      >
      {{day.date}}
        <span class="text-capitalize">{{day.dayOfWeek}}</span>
        <span>{{day.title}}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import octopusApi from '@saooti/octopus-api';
import { defineComponent } from 'vue';
import { Canal } from '@/stores/class/radio/canal';
import { PlanningOccurrence } from '@/stores/class/radio/recurrence';
export default defineComponent({
  name: 'RadioPlanning',

  components: {
  },

  props: {
    radio: { default: undefined, type: Object as ()=>Canal},
  },

  data() {
    return {
      occurrences: [] as Array<PlanningOccurrence>,
      daySelected: dayjs().toDate(),
    };
  },

  computed:{
    arrayDays(): Array<{title: string, date: Date, dayOfWeek: string }>{
      let days = [];
      for (let index = 7; index > 0; index--) {
        const dayToAdd = dayjs().subtract(index, 'day');
        days.push(this.constructDateObject(dayToAdd));
      }
      for (let index = 0; index < 3; index++) {
        const dayToAdd = dayjs().add(index, 'day');
        days.push(this.constructDateObject(dayToAdd));
      }
      return days;
    },
    startOfDay(): number{
      return dayjs(this.daySelected).utcOffset(0).startOf('date').valueOf();
    },
    endOfDay(): number{
      return dayjs(this.daySelected).utcOffset(0).endOf('date').valueOf();
    },
  },

  mounted(){
    this.fetchOccurrences();
  },
  
  methods: {
    async fetchOccurrences(): Promise<void>{
      const param = {canalId: this.radio?.id,from: this.startOfDay,to: this.endOfDay};
      this.occurrences = await octopusApi.fetchDataWithParams<Array<PlanningOccurrence>>( 14, 'planning/occurrence/list',param);
    },
    constructDateObject(date:dayjs.Dayjs){
      return {title: date.format('D/MM'), dayOfWeek:date.format('dddd'),  date : date.toDate()};
    }
  },
})
</script>
<style lang="scss">
.octopus-app{
}
</style>