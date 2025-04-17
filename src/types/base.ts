export type StringIdEntity = {
  id: string;
  created_at: string;
  updated_at: string;
}

export type NumberIdEntity = {
  id: number;
  created_at: string;
  updated_at: string;
}

export type BaseEntity = StringIdEntity | NumberIdEntity;