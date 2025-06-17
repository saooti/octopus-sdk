<template>
  <div class="d-flex mt-3 align-items-center flex-wrap">
    <div v-if="isEmission" class="me-2">
      {{ t("Emission with episode published :") }}
    </div>
    <div v-for="index in 2" :key="index" class="d-flex align-items-center">
      <ClassicCheckbox
        v-model:text-init="isActive[index - 1]"
        class="flex-shrink-0"
        :id-checkbox="'search-checkbox' + index"
        :label="1 === index ? t('From the :') : t('To the :')"
      />
      <ClassicDatePicker
        :id="'date-filter-chooser'+index"
        :label="1 === index ? t('From the :') : t('To the :')"
        :date="internDates[index - 1]"
        class="mx-2"
        @update-date="updateDate(index - 1, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";
import ClassicDatePicker from "../../form/ClassicDatePicker.vue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  isEmission: { default: false, type: Boolean },
  fromDate: { default: undefined, type: String },
  toDate: { default: undefined, type: String },
})

//Emits
const emit = defineEmits(["updateDates"]);

//Data 
const isActive = ref([false, false]);
const internDates = ref([
  dayjs().subtract(10, "days").startOf("day").toDate(),
  dayjs().endOf("day").toDate(),
]);

//Composables
const { t } = useI18n();


//Watch
watch(()=>props.toDate, () => {
  isActive.value[1] = undefined !== props.toDate;
  if (props.toDate && props.toDate !== internDates.value[1].toISOString()) {
    internDates.value[1] = dayjs(props.toDate).toDate();
  }
}, {immediate: true});
watch(()=>props.fromDate, () => {
  isActive.value[0] = undefined !== props.fromDate;
  if (props.fromDate && props.fromDate !== internDates.value[0].toISOString()) {
    internDates.value[0] = dayjs(props.fromDate).toDate();
  }
}, {immediate: true});
watch(()=>props.fromDate, () => {
  emit("updateDates", {
    from: isActive.value[0]
      ? dayjs(internDates.value[0]).toISOString()
      : undefined,
    to: isActive.value[1]
      ? dayjs(internDates.value[1]).toISOString()
      : undefined,
  });
}, {deep: true});


//Methods
function updateDate(index: number, value: Date): void {
  internDates.value[index] = value;
  if (
    (0 === index &&
      dayjs(internDates.value[0]).startOf("minute").toISOString() ===
        dayjs().subtract(10, "days").startOf("minute").toISOString()) ||
    (1 === index &&
      dayjs(internDates.value[1]).startOf("minute").toISOString() ===
        dayjs().startOf("minute").toISOString())
  ) {
    return;
  }
  if (isActive.value[index]) {
    emit("updateDates", {
      from:
        0 === index
          ? dayjs(internDates.value[0]).toISOString()
          : props.fromDate,
      to:
        1 === index
          ? dayjs(internDates.value[1]).toISOString()
          : props.toDate,
    });
  } else {
    isActive.value[index] = true;
  }
}
</script>
