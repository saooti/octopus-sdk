import { defineComponent } from 'vue'
export default defineComponent({
  fetchOrganisationAttibutes(store: any, organisationId: any): any {
    return new Promise(resolve => {
      console.log(store, organisationId);
      resolve({});
    });
  },
};
