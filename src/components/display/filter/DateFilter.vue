<template>
  <div class="d-flex mt-3 align-items-center flex-wrap">
    <div
      v-if="isEmission"
      class="me-2"
    >
      {{ $t('Emission with episode published :') }}
    </div>
    <div class="d-flex align-items-center">
      <ClassicCheckbox
        v-model:textInit="isFrom"
        class="flex-shrink-0"
        id-checkbox="search-from-checkbox"
        :label="$t('From the :')"
      />
      <DatePicker
        v-model="fromDate"
        class="ps-3 pe-3"
        mode="dateTime"
        color="green"
        is24hr
        @update:modelValue="updateFromDate()"
      >
        <template #default="{ inputValue, inputEvents }">
          <input
            class="px-2 py-1 border rounded focus:border-blue-300"
            :value="inputValue"
            v-on="inputEvents"
          >
        </template>
      </DatePicker>
    </div>
    <div class="d-flex align-items-center">
      <ClassicCheckbox
        v-model:textInit="isTo"
        class="flex-shrink-0"
        id-checkbox="search-to-checkbox"
        :label="$t('To the :')"
      />
      <DatePicker
        v-model="toDate"
        class="ps-3"
        mode="dateTime"
        color="green"
        is24hr
        @update:modelValue="updateToDate()"
      >
        <template #default="{ inputValue, inputEvents }">
          <input
            class="px-2 py-1 border rounded focus:border-blue-300"
            :value="inputValue"
            v-on="inputEvents"
          >
        </template>
      </DatePicker>
    </div>
  </div>
      
</template>

<script lang="ts">
import moment from 'moment';
import ClassicCheckbox from '../../form/ClassicCheckbox.vue';
import { DatePicker } from 'v-calendar';
import { defineComponent } from 'vue';
export default defineComponent({
  components: {
    DatePicker,
    ClassicCheckbox,
  },
  props: {
    isEmission: { default: false, type:  Boolean},
    initToDate: { default: undefined, type:  String},
    initFromDate: { default: undefined, type:  String},
  },

  emits: ['updateToDate', 'updateFromDate'],

  data() {
    return {
      isFrom: false as boolean,
      isTo: false as boolean,
      fromDate: moment().subtract(10, 'days').toISOString() as string,
      toDate: moment().toISOString() as string,
    };
  },

  watch: {
    isFrom(): void {
      this.$emit('updateFromDate', this.isFrom ? moment(this.fromDate).toISOString(true) : undefined);
    },
    isTo(): void {
      this.$emit('updateToDate', this.isTo ? moment(this.toDate).toISOString(true) : undefined);
    },
  },

  created(){
    if(this.initToDate){
      this.toDate = this.initToDate;
      this.isTo = true;
    }
    if(this.initFromDate){
      this.fromDate = this.initFromDate;
      this.isFrom = true;
    }
  },
  methods: {
    updateFromDate(): void {
      if (
        moment(this.fromDate)
          .startOf('minute')
          .toISOString() ===
        moment()
          .subtract(10, 'days')
          .startOf('minute')
          .toISOString()
      )
        return;
      if (this.isFrom) {
        this.$emit('updateFromDate', moment(this.fromDate).toISOString(true));
      } else {
        this.isFrom = true;
      }
    },
    updateToDate(): void {
      if (
        moment(this.toDate)
          .startOf('minute')
          .toISOString() ===
        moment()
          .startOf('minute')
          .toISOString()
      )
        return;
      if (this.isTo) {
        this.$emit('updateToDate', moment(this.toDate).toISOString(true));
      } else {
        this.isTo = true;
      }
    },
  },
})
</script>
