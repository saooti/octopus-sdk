import { Organisation } from "./organisation";

export interface Person{
    attributes?:{[key: string]:string|number|boolean|undefined}|undefined;
    email: string;
    emailVerified: boolean;
    enabled: true;
    first: string;
    last: string;
    notSeenOnKeycloak: number;
    userId: string;
    organisation?: Organisation;
}