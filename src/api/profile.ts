import { StoreState } from "@/store/typeAppStore";
/* eslint-disable */
export default{
  fetchOrganisationAttibutes(store: StoreState, organisationId: string): Promise<any> {
    return new Promise(resolve => {
      console.log(store, organisationId);
      resolve({});
    });
  },
};
/* eslint-enable */