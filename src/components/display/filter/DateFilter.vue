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
      <ClassicDatePicker
        class="ps-3 pe-3"
        :date="fromDate"
        template-class="px-2 py-1 border rounded focus:border-blue-300"
        @updateDate="fromDate=$event;updateFromDate"
      />
    </div>
    <div class="d-flex align-items-center">
      <ClassicCheckbox
        v-model:textInit="isTo"
        class="flex-shrink-0"
        id-checkbox="search-to-checkbox"
        :label="$t('To the :')"
      />
      <ClassicDatePicker
        class="ps-3"
        :date="toDate"
        template-class="px-2 py-1 border rounded focus:border-blue-300"
        @updateDate="toDate=$event;updateToDate"
      />
    </div>
  </div>
</template>

<script lang="ts">
import moment from 'moment';
import ClassicCheckbox from '../../form/ClassicCheckbox.vue';
import ClassicDatePicker from '../../form/ClassicDatePicker.vue';
import { defineComponent } from 'vue';
export default defineComponent({
  components: {
    ClassicDatePicker,
    ClassicCheckbox,
  },
  props: {
    isEmission: { default: false, type:  Boolean},
    initToDate: { default: undefined, type:  Date},
    initFromDate: { default: undefined, type:  Date},
  },

  emits: ['updateToDate', 'updateFromDate'],

  data() {
    return {
      isFrom: false as boolean,
      isTo: false as boolean,
      fromDate: moment().subtract(10, 'days').toDate(),
      toDate: moment().toDate(),
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