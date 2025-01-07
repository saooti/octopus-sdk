<template>
  <div class="d-flex mt-3 align-items-center flex-wrap">
    <div v-if="isEmission" class="me-2">
      {{ $t("Emission with episode published :") }}
    </div>
    <div v-for="index in 2" :key="index" class="d-flex align-items-center">
      <ClassicCheckbox
        v-model:text-init="isActive[index - 1]"
        class="flex-shrink-0"
        :id-checkbox="'search-checkbox' + index"
        :label="1 === index ? $t('From the :') : $t('To the :')"
      />
      <ClassicDatePicker
        :id="'date-filter-chooser'+index"
        :label="1 === index ? $t('From the :') : $t('To the :')"
        :date="internDates[index - 1]"
        class="mx-2"
        @update-date="updateDate(index - 1, $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";
import ClassicDatePicker from "../../form/ClassicDatePicker.vue";
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    ClassicDatePicker,
    ClassicCheckbox,
  },

  props: {
    isEmission: { default: false, type: Boolean },
    fromDate: { default: undefined, type: String },
    toDate: { default: undefined, type: String },
  },

  emits: ["updateDates"],

  data() {
    return {
      isActive: [false, false] as Array<boolean>,
      internDates: [
        dayjs().subtract(10, "days").startOf("day").toDate(),
        dayjs().endOf("day").toDate(),
      ],
    };
  },

  watch: {
    toDate: {
      immediate: true,
      handler() {
        this.isActive[1] = undefined !== this.toDate;
        if (this.toDate && this.toDate !== this.internDates[1].toISOString()) {
          this.internDates[1] = dayjs(this.toDate).toDate();
        }
      },
    },
    fromDate: {
      immediate: true,
      handler() {
        this.isActive[0] = undefined !== this.fromDate;
        if (
          this.fromDate &&
          this.fromDate !== this.internDates[0].toISOString()
        ) {
          this.internDates[0] = dayjs(this.fromDate).toDate();
        }
      },
    },
    isActive: {
      deep: true,
      handler() {
        this.$emit("updateDates", {
          from: this.isActive[0]
            ? dayjs(this.internDates[0]).toISOString()
            : undefined,
          to: this.isActive[1]
            ? dayjs(this.internDates[1]).toISOString()
            : undefined,
        });
      },
    },
  },

  methods: {
    updateDate(index: number, value: Date): void {
      this.internDates[index] = value;
      if (
        (0 === index &&
          dayjs(this.internDates[0]).startOf("minute").toISOString() ===
            dayjs().subtract(10, "days").startOf("minute").toISOString()) ||
        (1 === index &&
          dayjs(this.internDates[1]).startOf("minute").toISOString() ===
            dayjs().startOf("minute").toISOString())
      ) {
        return;
      }
      if (this.isActive[index]) {
        this.$emit("updateDates", {
          from:
            0 === index
              ? dayjs(this.internDates[0]).toISOString()
              : this.fromDate,
          to:
            1 === index
              ? dayjs(this.internDates[1]).toISOString()
              : this.toDate,
        });
      } else {
        this.isActive[index] = true;
      }
    },
  },
});
</script>
