import { User } from 'src/app/users/interfaces/users.interface';

export interface LoginResponse {
  user: User;
  token: string;
}
