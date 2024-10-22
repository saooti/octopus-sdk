export interface UserRole {
  clientRole: boolean;
  composite: boolean;
  containerId: string;
  id: string;
  name: string;
}

export interface UserKeycloak {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  organisation?: string;
  telephone?: string;
  description?: string;
  project?: string;
  realmRoles?: null | Array<string>;
  attributes?: { [key: string]: Array<string | boolean> | undefined };
  password?: string;
  isTemporary?: boolean;
  getted?: boolean;
  emailVerified?: boolean;
  requiredActions?: Array<string>;
}
