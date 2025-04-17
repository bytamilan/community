"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CommentForm } from "@/components/comment-form"
import { VoteButtons } from "@/components/vote-buttons"
import { MessageSquare } from "lucide-react"
import type { Comment } from "@/lib/types"

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  isReply?: boolean
}

function CommentItem({ comment, isReply = false }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const author = comment.author || { username: "Unknown", avatar_url: null }

  return (
    <div className={isReply ? "ml-8 mt-4" : ""}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={author.avatar_url || undefined} alt={author.username} />
              <AvatarFallback>{author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{author.username}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <VoteButtons commentId={comment.id} upvotes={comment.upvotes} downvotes={comment.downvotes} />
              </div>
              <div className="mt-2">{comment.content}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="py-2">
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowReplyForm(!showReplyForm)}>
            <MessageSquare className="h-3 w-3 mr-1" />
            {showReplyForm ? "Cancel" : "Reply"}
          </Button>
        </CardFooter>
      </Card>

      {showReplyForm && (
        <div className="mt-4 ml-8">
          <CommentForm postId={comment.post_id} parentId={comment.id} onCancel={() => setShowReplyForm(false)} />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  )
}
