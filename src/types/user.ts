import { StringIdEntity, NumberIdEntity } from './base';

export type Role = NumberIdEntity & {
  name: string;
}

export type Profile = StringIdEntity & {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  credits: number;
  role_id: number;
  role?: Role;
}