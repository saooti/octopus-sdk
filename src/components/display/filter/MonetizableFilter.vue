<template>
  <ClassicSelect
    v-model:text-init="monetisableForVmodel"
    id-select="monetizable-filter-select"
    :label="$t('Advertising') + ' :'"
    :display-label="true"
    class-label="flex-shrink-0 me-1"
    class="d-flex align-items-center"
    :options="[
      { title: allString, value: 'UNDEFINED' },
      { title: $t('Authorized advertising'), value: 'YES' },
      { title: $t('Prohibited advertising'), value: 'NO' },
    ]"
  />
</template>

<script lang="ts">
import ClassicSelect from "../../form/ClassicSelect.vue";
import { defineComponent } from "vue";
export default defineComponent({
  components:{
    ClassicSelect
  },
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
