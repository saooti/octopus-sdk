import { state } from '../../store/paramStore';
import { defineComponent } from 'vue';
export const orgaComputed = defineComponent({
  computed: {
		myOrganisationId(): string|undefined {
      return state.generalParameters.organisationId;
    },
    authenticated(): boolean {
      return (state.generalParameters.authenticated as boolean);
    },
		filterOrga(): string {
      return this.$store.state.filter.organisationId;
    },
  },
});
