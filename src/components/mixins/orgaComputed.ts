import { state } from "../../stores/ParamSdkStore";
import { useFilterStore } from "../../stores/FilterStore";
import { useAuthStore } from "../../stores/AuthStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export const orgaComputed = defineComponent({
  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    ...mapState(useAuthStore, ["isRoleAdmin", "authOrgaId"]),
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
  },
  methods:{
    isEditRights(orgaId?: string, condition = true){
      return (
        (condition && undefined!==this.authOrgaId&&
        this.authOrgaId === orgaId) ||
        this.isRoleAdmin
      );
    }
  }
});
