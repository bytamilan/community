import { createClient } from "@/lib/supabase/server"
import type { Category, Comment, Post, Profile, Tag, Notification } from "@/types"

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("profiles").select("*, roles(*)").eq("id", userId).single()

  if (error || !data) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data as unknown as Profile
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("profiles").select("*, roles(*)").eq("username", username).single()

  if (error || !data) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data as unknown as Profile
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single()

  if (error || !data) {
    console.error("Error fetching category:", error)
    return null
  }

  return data as Category
}

// Post functions
export async function getPosts(
  limit = 10,
  offset = 0,
  categorySlug?: string,
  tagSlug?: string,
): Promise<{ posts: Post[]; count: number }> {
  const supabase = await createClient()

  try {
    let query = supabase
      .from("posts")
      .select(
        "*, profiles!posts_author_id_fkey(username, avatar_url), categories!posts_category_id_fkey(name, slug, is_premium)",
        {
          count: "exact",
        },
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (categorySlug) {
      try {
        const category = await getCategoryBySlug(categorySlug)
        if (category) {
          query = query.eq("category_id", category.id)
        }
      } catch (categoryError) {
        console.error("Error fetching category:", categoryError)
        // Continue without category filter if there's an error
      }
    }

    if (tagSlug) {
      try {
        const tag = await getTagBySlug(tagSlug)
        if (tag) {
          // This is a more complex query with a join
          const { data: postIds, error: postIdsError } = await supabase
            .from("post_tags")
            .select("post_id")
            .eq("tag_id", tag.id)

          if (postIdsError) {
            console.error("Error fetching post IDs for tag:", postIdsError)
          } else if (postIds && postIds.length > 0) {
            const ids = postIds.map((item) => item.post_id)
            query = query.in("id", ids)
          } else {
            // No posts with this tag
            return { posts: [], count: 0 }
          }
        }
      } catch (tagError) {
        console.error("Error fetching tag:", tagError)
        // Continue without tag filter if there's an error
      }
    }

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching posts:", error)
      return { posts: [], count: 0 }
    }

    // Get comment counts for each post
    const postsWithCommentCounts = await Promise.all(
      (data || []).map(async (post) => {
        try {
          const { data: commentCountData } = await supabase.rpc("get_comment_count", { post_id: post.id })
          return {
            ...post,
            commentCount: commentCountData || 0,
          }
        } catch (commentCountError) {
          console.error("Error fetching comment count:", commentCountError)
          return {
            ...post,
            commentCount: 0,
          }
        }
      }),
    )

    return { posts: postsWithCommentCounts as unknown as Post[], count: count || 0 }
  } catch (error) {
    console.error("Error in getPosts:", error)
    return { posts: [], count: 0 }
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, profiles!posts_author_id_fkey(username, avatar_url), categories!posts_category_id_fkey(name, slug, is_premium, credit_requirement)",
    )
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("Error fetching post:", error)
    return null
  }

  // Increment view count
  await supabase.rpc("increment_view_count", { post_id: id })

  // Get post tags
  const { data: tagData } = await supabase.from("post_tags").select("tags(*)").eq("post_id", id)

  const tags = tagData?.map((item: any) => item.tags) || []

  // Get comment count
  const { data: commentCountData } = await supabase.rpc("get_comment_count", { post_id: id })

  return { ...data, tags, commentCount: commentCountData || 0 } as unknown as Post
}

export async function getPostsByUser(userId: string, limit = 10, offset = 0): Promise<Post[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*, categories!posts_category_id_fkey(name, slug, is_premium)")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching user posts:", error)
    return []
  }

  // Get comment counts for each post
  const postsWithCommentCounts = await Promise.all(
    (data as unknown as Post[]).map(async (post) => {
      const { data: commentCountData } = await supabase.rpc("get_comment_count", { post_id: post.id })
      return {
        ...post,
        commentCount: commentCountData || 0,
      }
    }),
  )

  return postsWithCommentCounts as unknown as Post[]
}

// Comment functions
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles!comments_author_id_fkey(username, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching comments:", error)
    return []
  }

  // Organize comments into a tree structure
  const commentMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  data.forEach((comment: any) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  data.forEach((comment: any) => {
    if (comment.parent_id) {
      const parentComment = commentMap.get(comment.parent_id)
      if (parentComment) {
        parentComment.replies?.push(commentMap.get(comment.id)!)
      }
    } else {
      rootComments.push(commentMap.get(comment.id)!)
    }
  })

  return rootComments as Comment[]
}

// Tag functions
export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("tags").select("*").order("name")

  if (error) {
    console.error("Error fetching tags:", error)
    return []
  }

  return data as Tag[]
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("tags").select("*").eq("slug", slug).single()

  if (error || !data) {
    console.error("Error fetching tag:", error)
    return null
  }

  return data as Tag
}

// Premium content access check
export async function canAccessPremiumCategory(userId: string, categoryId: number): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("can_access_premium_category", {
    user_id: userId,
    category_id: categoryId,
  })

  if (error) {
    console.error("Error checking premium access:", error)
    return false
  }

  return data
}

// Notification functions
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) {
    console.error("Error fetching notification count:", error)
    return 0
  }

  return count || 0
}

export async function getNotifications(userId: string, limit = 10): Promise<Notification[]> {
  const supabase = await createClient()

  // First, fetch the notifications without trying to join with sender
  const { data: notificationsData, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching notifications:", error)
    return []
  }

  // Now, for each notification with a sender_id, fetch the sender information
  const notificationsWithSenders = await Promise.all(
    notificationsData.map(async (notification) => {
      if (notification.sender_id) {
        const { data: senderData, error: senderError } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", notification.sender_id)
          .single()

        if (!senderError && senderData) {
          return {
            ...notification,
            sender: senderData,
          }
        }
      }
      return notification
    }),
  )

  return notificationsWithSenders as unknown as Notification[]
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

  if (error) {
    console.error("Error marking notification as read:", error)
    return false
  }

  return true
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) {
    console.error("Error marking all notifications as read:", error)
    return false
  }

  return true
}
