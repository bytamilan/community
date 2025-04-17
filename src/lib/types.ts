export type Role = {
  id: number
  name: string
  created_at: string
}

export type Profile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  credits: number
  role_id: number
  role?: Role
  created_at: string
  updated_at: string
}

// Content Types
export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  credit_requirement: number
  is_premium: boolean
  created_at: string
  updated_at: string
}

export type Tag = {
  id: number
  name: string
  slug: string
  created_at: string
}

export type Post = {
  id: string
  title: string
  content: string
  author_id: string
  author?: Profile
  category_id: number
  category?: Category
  view_count: number
  upvotes: number
  downvotes: number
  credit_cost: number
  is_published: boolean
  tags?: Tag[]
  commentCount?: number
  created_at: string
  updated_at: string
}

export type Comment = {
  id: string
  content: string
  author_id: string
  author?: Profile
  post_id: string
  parent_id: string | null
  upvotes: number
  downvotes: number
  replies?: Comment[]
  created_at: string
  updated_at: string
}

export type Vote = {
  id: string
  user_id: string
  post_id: string | null
  comment_id: string | null
  vote_type: number // 1 for upvote, -1 for downvote
  created_at: string
}

export type CreditTransaction = {
  id: string
  user_id: string
  amount: number
  description: string
  post_id: string | null
  comment_id: string | null
  created_at: string
}

export type NotificationType = "comment" | "reply" | "mention" | "vote" | "credit" | "system"

export type Notification = {
  id: string
  user_id: string
  sender_id: string | null
  sender?: Profile
  type: NotificationType
  content: string
  post_id: string | null
  comment_id: string | null
  is_read: boolean
  created_at: string
}
