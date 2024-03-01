export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
}
