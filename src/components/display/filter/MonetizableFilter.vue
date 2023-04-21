<template>
  <div class="d-flex align-items-center">
    <div>{{ $t('Advertising') + ' :' }}</div>
    <label class="position-relative">
      <select
        ref="select"
        v-model="monetization"
        class="ms-2 mb-0 c-hand"
        @change="onChange"
      >
        <option value="UNDEFINED">{{ allString }}</option>
        <option value="YES">{{ $t('Authorized advertising') }}</option>
        <option value="NO">{{ $t('Prohibited advertising') }}</option>
      </select>
      <div class="saooti-down octopus-arrow-down-absolute" />
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    isEmission: { default: false, type:  Boolean},
  },
  emits: ['updateMonetization'],

  data() {
    return {
      monetization: 'UNDEFINED' as string,
    };
  },
  computed:{
    allString(): string{
      return this.isEmission? this.$t('All emissions') : this.$t('All podcasts');
    }
  },
  methods: {
    onChange(): void {
      this.$emit('updateMonetization', this.monetization);
    },
  },
})
</script>