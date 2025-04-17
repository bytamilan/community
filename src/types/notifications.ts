import { BaseEntity } from './base';
import { Profile } from './user';

export type NotificationType = "comment" | "reply" | "mention" | "vote" | "credit" | "system";

export type Notification = BaseEntity & {
  user_id: string;
  sender_id: string | null;
  sender?: Profile;
  type: NotificationType;
  content: string;
  post_id: string | null;
  comment_id: string | null;
  is_read: boolean;
}