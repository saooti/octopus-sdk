export default{
  fetchOrganisationAttibutes(store: any, organisationId: any): any {
    return new Promise(resolve => {
      console.log(store, organisationId);
      resolve({});
    });
  },
};
