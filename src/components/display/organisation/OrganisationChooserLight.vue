<template>
  <div
    v-if="(!value || init) && organisation"
    class="default-multiselect-width organisation-chooser-light mb-1 ms-1"
    :style="{ width: width }"
  >
    <select
      :id="'organisation_chooser_light' + page"
      v-model="actual"
      class="c-hand w-100 transparent"
      @change="onOrganisationSelected"
    >
      <option :value="organisation.id">
        {{ organisation.name }}
      </option>
      <option :value="-1">
        {{ $t("No organisation filter") }}
      </option>
    </select>
    <label
      :for="'organisation_chooser_light' + page"
      class="d-inline"
      :title="$t('select productor')"
    />
  </div>
</template>

<script lang="ts">
import { Organisation } from "@/stores/class/general/organisation";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { mapActions } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    width: { default: "100%", type: String },
    value: { default: undefined, type: String },
    reset: { default: false, type: Boolean },
    page: { default: "", type: String },
  },
  emits: ["selected"],

  data() {
    return {
      actual: -1 as number | string,
      organisation: undefined as Organisation | undefined,
      init: false as boolean,
    };
  },

  watch: {
    value(): void {
      if (!this.init || this.value) {
        this.fetchOrganisation();
      }
    },
    reset(): void {
      this.actual = -1;
    },
  },

  created() {
    if (this.value) {
      this.fetchOrganisation();
    }
  },

  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaData"]),
    onOrganisationSelected(): void {
      this.$emit(
        "selected",
        -1 === this.actual ? undefined : this.organisation,
      );
    },
    async fetchOrganisation(): Promise<void> {
      if (!this.value) {
        return;
      }
      this.organisation = await this.getOrgaData(this.value);
      this.actual = this.organisation.id;
      this.init = true;
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  .organisation-chooser-light select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
}
</style>
