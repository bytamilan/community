"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { voteOnPost, voteOnComment } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"

interface VoteButtonsProps {
  postId?: string
  commentId?: string
  upvotes: number
  downvotes: number
}

export function VoteButtons({ postId, commentId, upvotes, downvotes }: VoteButtonsProps) {
  const [localUpvotes, setLocalUpvotes] = useState(upvotes)
  const [localDownvotes, setLocalDownvotes] = useState(downvotes)
  const [isVoting, setIsVoting] = useState(false)
  const { toast } = useToast()

  async function handleVote(voteType: 1 | -1) {
    if (isVoting) return

    setIsVoting(true)

    try {
      let result

      if (postId) {
        result = await voteOnPost(postId, voteType)
      } else if (commentId) {
        result = await voteOnComment(commentId, voteType)
      }

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        // Optimistically update the UI
        if (voteType === 1) {
          setLocalUpvotes((prev) => prev + 1)
        } else {
          setLocalDownvotes((prev) => prev + 1)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register vote",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => handleVote(1)}
        disabled={isVoting}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{localUpvotes}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => handleVote(-1)}
        disabled={isVoting}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{localDownvotes}</span>
      </Button>
    </div>
  )
}
