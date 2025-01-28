<template>
   <ClassicSelect
      v-if="(!value || init) && organisation"
      v-model:text-init="actual"
      :display-label="false"
      id-select="organisation-chooser-footer"
      :label="$t('select productor')"
      :transparent="true"
      :options="[
        { title: organisation.name, value: organisation.id },
        { title: $t('No organisation filter'), value: 'NONE' },
      ]"
      class="my-1"
    />
</template>

<script lang="ts">
import ClassicSelect from "../../form/ClassicSelect.vue";
import { Organisation } from "@/stores/class/general/organisation";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { mapActions } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  components:{
    ClassicSelect
  },
  props: {
    value: { default: undefined, type: String },
    reset: { default: false, type: Boolean },
  },
  emits: ["selected"],

  data() {
    return {
      actual: "NONE" as string,
      organisation: undefined as Organisation | undefined,
      init: false as boolean,
    };
  },

  watch: {
    value: {
      deep: true,
      immediate: true,
      async handler() {
        if (!this.init || this.value) {
          this.fetchOrganisation();
        }
      },
    },
    reset(): void {
      this.actual = "NONE";
    },
    actual(){
      this.$emit(
        "selected",
        "NONE" === this.actual ? undefined : this.organisation,
      );
    }
  },

  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaData"]),
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