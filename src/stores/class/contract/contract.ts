export interface Contract {
  name: string;
  id: string;
  updateDate: string;
  type?: string;
  signedStatus: boolean;
}

export function getContract(id: string, name: string): Contract {
  return {
    id: id,
    name: name,
    updateDate: "",
    signedStatus: true,
  };
}
