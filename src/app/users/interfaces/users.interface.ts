export interface User {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  roles?: Role[];
}

export interface Role {
  id?: string;
  name?: string;
}
