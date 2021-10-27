<template>
  <div
    v-if="(!value || init) && organisation"
    class="default-multiselect-width"
    :style="{ width: width }"
  >
    <select
      :id="'organisation_chooser_light' + page"
      v-model="actual"
      class="basic-select mb-0 c-hand"
      @change="onOrganisationSelected"
    >
      <option :value="organisation.id">
        {{ organisation.name }}
      </option>
      <option :value="-1">
        {{ $t('No organisation filter') }}
      </option>
    </select>
    <label
      :for="'organisation_chooser_light' + page"
      class="d-inline"
      :aria-label="$t('select productor')"
    />
  </div>
</template>

<script lang="ts">
import octopusApi from '@saooti/octopus-api';

import { Organisation } from '@/store/class/organisation';
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    width: { default: '100%', type: String},
    value: { default: undefined, type: String},
    reset: { default: false, type: Boolean},
    page: { default: '', type: String},
  },
  emits: ['selected'],

  data() {
    return  {
      actual: -1 as number,
      organisation: undefined as Organisation|undefined,
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
    onOrganisationSelected(): void{
      if (-1 === this.actual) {
        this.$emit('selected', undefined);
      } else {
        this.$emit('selected', this.organisation);
      }
    },
    async fetchOrganisation(): Promise<void> {
      if(!this.value){return;}
      const data = await octopusApi.fetchOrganisation(this.value);
      this.organisation = data;
      this.actual = data.id;
      this.init = true;
    },
  },
})
</script>

<style lang="scss"></style>