<template>
  <div class="page-box">
    <template v-if="!filterOrgaId && !organisationId && !isPodcastmaker">
      <div class="align-self-start fw-bold mb-2">
        {{ $t("Please chose a productor") }}
      </div>
      <OrganisationChooser
        :defaultanswer="$t('Please chose a productor')"
        @selected="onOrganisationSelected"
      />
    </template>
    <template v-if="filterOrgaId || organisationId">
      <LiveList :organisation-id="organisationId" />
      <RadioList :organisation-id="organisationId" />
    </template>
  </div>
</template>

<script lang="ts">
import { state } from "../../stores/ParamSdkStore";
import { Organisation } from "@/stores/class/general/organisation";
import { defineComponent, defineAsyncComponent } from "vue";
import { useFilterStore } from "@/stores/FilterStore";
import { mapState } from "pinia";
const LiveList = defineAsyncComponent(
  () => import("../display/live/LiveList.vue"),
);
const RadioList = defineAsyncComponent(
  () => import("../display/live/RadioList.vue"),
);
const OrganisationChooser = defineAsyncComponent(
  () => import("../display/organisation/OrganisationChooser.vue"),
);
export default defineComponent({
  components: {
    LiveList,
    RadioList,
    OrganisationChooser,
  },
  props: {
    organisationId: { default: undefined, type: String },
    productor: { default: undefined, type: String },
  },
  emits: ["update:organisationId"],

  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),

    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
  },
  created() {
    if (this.productor) {
      this.$emit("update:organisationId", this.productor);
    } else if (this.filterOrgaId) {
      this.$emit("update:organisationId", this.filterOrgaId);
    }
  },
  methods: {
    onOrganisationSelected(organisation: Organisation | undefined): void {
      this.$emit("update:organisationId", organisation?.id);
    },
  },
});
</script>
