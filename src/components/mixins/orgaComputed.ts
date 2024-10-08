import { state } from "../../stores/ParamSdkStore";
import { useFilterStore } from "../../stores/FilterStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export const orgaComputed = defineComponent({
  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    myOrganisationId(): string | undefined {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return state.generalParameters.authenticated as boolean;
    },
  },
});
