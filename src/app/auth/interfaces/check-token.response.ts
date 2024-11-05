import { User } from 'src/app/users/interfaces/users.interface';

export interface CheckTokenResponse {
  user: User;
  token: string;
}
