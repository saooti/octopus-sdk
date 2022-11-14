<template>
  <DatePicker
    ref="datePicker"
    :model-value="undefined!==range ? range : date"
    :mode="mode"
    color="green"
    is24hr
    :is-range="undefined!==range"
    :max-date="isMaxDate ? now : undefined"
    :min-date="isMinDate ? now : undefined"
    :columns="columnNumber"
    :is-inline="columnNumber>1"
    :update-on-input="conditionEdit"
    :masks="isMask ? masks : undefined"
    @update:modelValue="$emit('updateDate', $event)"
  >
    <template
      v-if="templateClass"
      #default="{ inputValue, inputEvents }"
    >
      <input
        :class="templateClass"
        :value="inputValue"
        v-on="inputEvents"
      >
    </template>
  </DatePicker>
</template>

<script lang="ts">
import moment from 'moment';
import { DatePicker } from 'v-calendar';
import { defineComponent } from 'vue';
export default defineComponent({
  components: {
    DatePicker,
  },
  props: {
    date: { default: undefined, type: Date},
    range: {default: undefined, type: Object as ()=>{ start: Date; end: Date }},
    isMaxDate:{ default: false, type:  Boolean},
    isMinDate:{ default: false, type:  Boolean},
    columnNumber:{default:1, type: Number},
    templateClass:{default: undefined,  type: String},
    mode:{default:"dateTime", type: String},
    isMask:{default: false,  type: Boolean},
    conditionEdit:{default: true,  type: Boolean},
  },

  emits: ['updateDate', 'update:date'],
  data() {
    return {
      masks: {
        input: 'YYYY-MM-DD',
      },
    };
  },
  computed: {
    now(): Date {
      return moment().add(1, 'days').toDate();
    },
  }
})
</script>
<style lang="scss">
@import '@scss/_variables.scss';
@import 'v-calendar/dist/style.css';
.octopus-app{
	.vc-select select{
		padding: 0 !important;
	}
	.vc-date{
		.vc-month,.vc-day,.vc-year{
			color: $octopus-primary-color !important;
		}
	}
	.vc-highlight{
		background-color: $octopus-primary-color !important;
	}
	.vc-select select:focus{
		border-color: $octopus-primary-color !important;
	}
}
</style>