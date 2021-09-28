<template>
  <div
    class="default-multiselect-width"
    :style="{ width: width }"
    v-if="(!value || init) && organisation"
  >
    <select
      :id="'organisation_chooser_light' + page"
      class="basic-select mb-0 c-hand"
      v-model="actual"
      @change="onOrganisationSelected"
    >
      <option :value="organisation.id">{{ organisation.name }}</option>
      <option :value="-1">{{ $t('No organisation filter') }}</option>
    </select>
    <label
      :for="'organisation_chooser_light' + page"
      class="d-inline"
      :aria-label="$t('select productor')"
    ></label>
  </div>
</template>

<style lang="scss"></style>

<script lang="ts">
const octopusApi = require('@saooti/octopus-api');

import { Organisation } from '@/store/class/organisation';
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    width: { default: '100%' },
    value: { default: null },
    reset: { default: false },
    page: { default: '' },
  },
  emits: ['selected'],

  data() {
    return  {
      actual: -1 as number,
      organisation: undefined as Organisation|undefined,
      init: false as boolean,
    };
  },

  created() {
    if (this.value) {
      this.fetchOrganisation();
    }
  },

  methods: {
    onOrganisationSelected(): void{
      if (-1 === this.actual) {
        this.$emit('selected', undefined);
      } else {
        this.$emit('selected', this.organisation);
      }
    },
    async fetchOrganisation(): Promise<void> {
      const data = await octopusApi.fetchOrganisation(this.value);
      this.organisation = data;
      this.actual = data.id;
      this.init = true;
    },
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
})
</script>
