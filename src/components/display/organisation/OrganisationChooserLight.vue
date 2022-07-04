<template>
  <div
    v-if="(!value || init) && organisation"
    class="default-multiselect-width organisation-chooser-light"
    :style="{ width: width }"
  >
    <select
      :id="'organisation_chooser_light' + page"
      v-model="actual"
      class="mb-0 c-hand border-0"
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
      :title="$t('select productor')"
    />
  </div>
</template>

<script lang="ts">
import { Organisation } from '@/store/class/general/organisation';
import octopusApi from '@saooti/octopus-api';
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
      actual: -1 as number|string,
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
      const data = await octopusApi.fetchData<Organisation>(0,`organisation/${this.value}`);
      this.organisation = data;
      this.actual = data.id;
      this.init = true;
    },
  },
})
</script>

<style lang="scss">
.octopus-app{
.organisation-chooser-light select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
}
</style>