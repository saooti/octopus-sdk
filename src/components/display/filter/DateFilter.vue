<template>
  <div class="d-flex mt-3 align-items-center flex-wrap">
    <div v-if="isEmission" class="me-2">
      {{ $t("Emission with episode published :") }}
    </div>
    <div class="d-flex align-items-center">
      <ClassicCheckbox
        v-model:textInit="isFrom"
        class="flex-shrink-0"
        id-checkbox="search-from-checkbox"
        :label="$t('From the :')"
      />
      <ClassicDatePicker
        :date="fromDate"
        class="mx-2"
        @update-date="
          fromDate = $event;
          updateFromDate();
        "
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
        :date="toDate"
        class="mx-2"
        @update-date="
          toDate = $event;
          updateToDate();
        "
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
    initToDate: { default: undefined, type: Date },
    initFromDate: { default: undefined, type: Date },
  },

  emits: ["updateToDate", "updateFromDate"],

  data() {
    return {
      isFrom: false as boolean,
      isTo: false as boolean,
      fromDate: dayjs().subtract(10, "days").toDate(),
      toDate: dayjs().toDate(),
    };
  },

  watch: {
    isFrom(): void {
      this.$emit(
        "updateFromDate",
        this.isFrom ? dayjs(this.fromDate).toISOString() : undefined,
      );
    },
    isTo(): void {
      this.$emit(
        "updateToDate",
        this.isTo ? dayjs(this.toDate).toISOString() : undefined,
      );
    },
  },

  created() {
    if (this.initToDate) {
      this.toDate = this.initToDate;
      this.isTo = true;
    }
    if (this.initFromDate) {
      this.fromDate = this.initFromDate;
      this.isFrom = true;
    }
  },
  methods: {
    updateFromDate(): void {
      if (
        dayjs(this.fromDate).startOf("minute").toISOString() ===
        dayjs().subtract(10, "days").startOf("minute").toISOString()
      )
        return;
      if (this.isFrom) {
        this.$emit("updateFromDate", dayjs(this.fromDate).toISOString());
      } else {
        this.isFrom = true;
      }
    },
    updateToDate(): void {
      if (
        dayjs(this.toDate).startOf("minute").toISOString() ===
        dayjs().startOf("minute").toISOString()
      )
        return;
      if (this.isTo) {
        this.$emit("updateToDate", dayjs(this.toDate).toISOString());
      } else {
        this.isTo = true;
      }
    },
  },
});
</script>
