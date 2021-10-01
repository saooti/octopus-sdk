import { StoreState } from "@/store/typeAppStore";

export default{
  fetchOrganisationAttibutes(store: StoreState, organisationId: string): any {
    return new Promise(resolve => {
      console.log(store, organisationId);
      resolve({});
    });
  },
};
