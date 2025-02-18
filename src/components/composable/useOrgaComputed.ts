import { computed } from "vue";
import { useAuthStore } from "../../stores/AuthStore";
import { state } from "../../stores/ParamSdkStore";
export const useOrgaComputed = ()=>{

  const authStore = useAuthStore();

  const isPodcastmaker = computed(() =>state.generalParameters.podcastmaker as boolean);

  function isEditRights(orgaId?: string, condition = true){
    return (
      (condition && undefined!==authStore.authOrgaId&&
        authStore.authOrgaId === orgaId) ||
        authStore.isRoleAdmin
    );
  }

	return {
    isPodcastmaker,
    isEditRights,
    authOrgaId: authStore.authOrgaId
	}
}