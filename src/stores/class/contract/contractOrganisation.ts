import { Contract } from "./contract";

export interface ContractOrganisation{
    contractList: Array<Contract>;
    enable: boolean;
    valide: boolean;
}