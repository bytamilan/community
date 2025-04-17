import { StringIdEntity } from './base';
import { Profile } from './user';

export type Comment = StringIdEntity & {
  content: string;
  author_id: string;
  author?: Profile;
  post_id: string;
  parent_id: string | null;
  upvotes: number;
  downvotes: number;
  replies?: Comment[];
}

export type Vote = StringIdEntity & {
  user_id: string;
  post_id: string | null;
  comment_id: string | null;
  vote_type: 1 | -1;
}

export type CreditTransaction = StringIdEntity & {
  user_id: string;
  amount: number;
  description: string;
  post_id: string | null;
  comment_id: string | null;
}