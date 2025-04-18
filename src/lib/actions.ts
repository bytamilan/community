"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type ActionResult<T = void> = Promise<{ error: string } | ({ success: true } & T)>

// Post actions
export async function createPost(formData: FormData): ActionResult<{ postId: string }> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "You must be logged in to create a post" }
    }

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const categoryId = Number.parseInt(formData.get("category_id") as string)
    const creditCost = Number.parseInt(formData.get("credit_cost") as string) || 1
    const tagIds = formData.getAll("tags") as string[]

    if (!title || !content || !categoryId) {
        return { error: "Title, content, and category are required" }
    }

    try {
        // Insert the post
        const { data: post, error: postError } = await supabase
            .from("posts")
            .insert({
                title,
                content,
                author_id: user.id,
                category_id: categoryId,
                credit_cost: creditCost,
            })
            .select()
            .single()

        if (postError) {
            return { error: postError.message }
        }

        // Add tags if provided
        if (tagIds.length > 0) {
            const tagEntries = tagIds.map((tagId) => ({
                post_id: post.id,
                tag_id: Number.parseInt(tagId),
            }))

            const { error: tagError } = await supabase.from("post_tags").insert(tagEntries)

            if (tagError) {
                console.error("Error adding tags:", tagError)
            }
        }

        revalidatePath("/")
        return { success: true, postId: post.id }
    } catch (error) {
        console.error("Error creating post:", error)
        return { error: "Failed to create post. Please try again." }
    }
}

export async function createComment(formData: FormData): ActionResult {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "You must be logged in to comment" }
    }

    const content = formData.get("content") as string
    const postId = formData.get("post_id") as string
    const parentId = (formData.get("parent_id") as string) || null

    if (!content || !postId) {
        return { error: "Content and post ID are required" }
    }

    try {
        const { error } = await supabase.from("comments").insert({
            content,
            author_id: user.id,
            post_id: postId,
            parent_id: parentId,
        })

        if (error) {
            return { error: error.message }
        }

        revalidatePath(`/posts/${postId}`)
        return { success: true }
    } catch (error) {
        console.error("Error creating comment:", error)
        return { error: "Failed to create comment. Please try again." }
    }
}

export async function voteOnPost(postId: string, voteType: 1 | -1): ActionResult {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "You must be logged in to vote" }
    }

    try {
        // Check if user has already voted on this post
        const { data: existingVote } = await supabase
            .from("votes")
            .select("id, vote_type")
            .eq("user_id", user.id)
            .eq("post_id", postId)
            .maybeSingle()

        if (existingVote) {
            if (existingVote.vote_type === voteType) {
                // Remove vote if clicking the same button
                await supabase.from("votes").delete().eq("id", existingVote.id)

                // Update post vote count
                await supabase.rpc("update_post_votes", {
                    p_post_id: postId,
                    p_vote_type: -voteType,
                })
            } else {
                // Change vote type
                await supabase.from("votes").update({ vote_type: voteType }).eq("id", existingVote.id)

                // Update post vote count (double the effect since we're flipping the vote)
                await supabase.rpc("update_post_votes", {
                    p_post_id: postId,
                    p_vote_type: voteType * 2,
                })
            }
        } else {
            // Create new vote
            await supabase.from("votes").insert({
                user_id: user.id,
                post_id: postId,
                vote_type: voteType,
            })

            // Update post vote count
            await supabase.rpc("update_post_votes", {
                p_post_id: postId,
                p_vote_type: voteType,
            })
        }

        revalidatePath(`/posts/${postId}`)
        return { success: true }
    } catch (error) {
        console.error("Error voting on post:", error)
        return { error: "Failed to register vote. Please try again." }
    }
}

export async function voteOnComment(commentId: string, voteType: 1 | -1): ActionResult {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "You must be logged in to vote" }
    }

    try {
        // Check if user has already voted on this comment
        const { data: existingVote } = await supabase
            .from("votes")
            .select("id, vote_type")
            .eq("user_id", user.id)
            .eq("comment_id", commentId)
            .maybeSingle()

        if (existingVote) {
            if (existingVote.vote_type === voteType) {
                // Remove vote if clicking the same button
                await supabase.from("votes").delete().eq("id", existingVote.id)

                // Update comment vote count
                await supabase.rpc("update_comment_votes", {
                    c_comment_id: commentId,
                    c_vote_type: -voteType,
                })
            } else {
                // Change vote type
                await supabase.from("votes").update({ vote_type: voteType }).eq("id", existingVote.id)

                // Update comment vote count (double the effect since we're flipping the vote)
                await supabase.rpc("update_comment_votes", {
                    c_comment_id: commentId,
                    c_vote_type: voteType * 2,
                })
            }
        } else {
            // Create new vote
            await supabase.from("votes").insert({
                user_id: user.id,
                comment_id: commentId,
                vote_type: voteType,
            })

            // Update comment vote count
            await supabase.rpc("update_comment_votes", {
                c_comment_id: commentId,
                c_vote_type: voteType,
            })
        }

        // Get the post ID for the comment to revalidate the path
        const { data: comment } = await supabase.from("comments").select("post_id").eq("id", commentId).single()

        if (comment) {
            revalidatePath(`/posts/${comment.post_id}`)
        }

        return { success: true }
    } catch (error) {
        console.error("Error voting on comment:", error)
        return { error: "Failed to register vote. Please try again." }
    }
}

export async function updateProfile(formData: FormData): ActionResult {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "You must be logged in to update your profile" }
    }

    const username = formData.get("username") as string
    const fullName = formData.get("full_name") as string
    const bio = formData.get("bio") as string
    const avatarUrl = formData.get("avatar_url") as string

    if (!username) {
        return { error: "Username is required" }
    }

    try {
        // Check if username is already taken by another user
        const { data: existingUser } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .neq("id", user.id)
            .maybeSingle()

        if (existingUser) {
            return { error: "Username is already taken" }
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                username,
                full_name: fullName || null,
                bio: bio || null,
                avatar_url: avatarUrl || null,
            })
            .eq("id", user.id)

        if (error) {
            return { error: error.message }
        }

        revalidatePath("/profile")
        return { success: true }
    } catch (error) {
        console.error("Error updating profile:", error)
        return { error: "Failed to update profile. Please try again." }
    }
}

// Credit actions
export async function claimDailyLoginBonus(): ActionResult {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "You must be logged in to claim a bonus" }
    }

    try {
        const { data, error } = await supabase.rpc("award_daily_login_bonus", {
            user_id: user.id,
        })

        if (error) {
            return { error: error.message }
        }

        if (data) {
            revalidatePath("/credits")
            return { success: "You've received 5 credits as a daily login bonus!" }
        } else {
            return { error: "You've already claimed your daily bonus today." }
        }
    } catch (error) {
        console.error("Error claiming daily bonus:", error)
        return { error: "Failed to claim daily bonus. Please try again." }
    }
}

// Notification actions
export async function markNotificationRead(formData: FormData): ActionResult {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "You must be logged in" }
    }

    const notificationId = formData.get("notification_id") as string

    if (!notificationId) {
        return { error: "Notification ID is required" }
    }

    try {
        // First check if the notification belongs to the user
        const { data: notification } = await supabase
            .from("notifications")
            .select("user_id")
            .eq("id", notificationId)
            .single()

        if (!notification || notification.user_id !== user.id) {
            return { error: "Notification not found or access denied" }
        }

        const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error("Error marking notification as read:", error)
        return { error: "Failed to mark notification as read" }
    }
}

export async function markAllNotificationsRead(): ActionResult {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return { error: "You must be logged in" }
    }

    try {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error("Error marking all notifications as read:", error)
        return { error: "Failed to mark all notifications as read" }
    }
}
