<template>
  <div class="d-flex align-items-center">
    <label for="monetizable-filter-select">{{ $t("Advertising") + " :" }}</label>
    <select
      id="monetizable-filter-select"
      ref="select"
      v-model="monetisableForVmodel"
      :title="$t('Advertising')"
      class="ms-2 mb-0 c-hand"
    >
      <option value="UNDEFINED">
        {{ allString }}
      </option>
      <option value="YES">
        {{ $t("Authorized advertising") }}
      </option>
      <option value="NO">
        {{ $t("Prohibited advertising") }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    isEmission: { default: false, type: Boolean },
    monetisable: { default: "UNDEFINED", type: String },
  },
  emits: ["update:monetisable"],

  data() {
    return {};
  },
  computed: {
    allString(): string {
      return this.isEmission
        ? this.$t("All emissions")
        : this.$t("All podcasts");
    },
    monetisableForVmodel: {
      get(): string {
        return this.monetisable;
      },
      set(value: string) {
        this.$emit("update:monetisable", value);
      },
    },
  },
});
</script>
