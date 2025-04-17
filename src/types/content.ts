import { StringIdEntity, NumberIdEntity } from './base';
import { Profile } from './user';

export type Category = NumberIdEntity & {
  name: string;
  slug: string;
  description: string | null;
  credit_requirement: number;
  is_premium: boolean;
}

export type Tag = NumberIdEntity & {
  name: string;
  slug: string;
}

export type Post = StringIdEntity & {
  title: string;
  content: string;
  author_id: string;
  author?: Profile;
  category_id: number;
  category?: Category;
  view_count: number;
  upvotes: number;
  downvotes: number;
  credit_cost: number;
  is_published: boolean;
  tags?: Tag[];
  commentCount?: number;
}