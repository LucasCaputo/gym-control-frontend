import { Role } from './enums';

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface CreateAdminDto {
  name: string;
  email: string;
  password: string;
  role: Role;
}
