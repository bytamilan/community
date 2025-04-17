"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { claimDailyLoginBonus } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Gift } from "lucide-react"

interface DailyBonusButtonProps {
  hasClaimedToday: boolean
}

export function DailyBonusButton({ hasClaimedToday }: DailyBonusButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [claimed, setClaimed] = useState(hasClaimedToday)
  const { toast } = useToast()
  const router = useRouter()

  async function handleClaimBonus() {
    setIsLoading(true)

    try {
      const result = await claimDailyLoginBonus()

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        toast({
          title: "Success",
          description: result.success,
        })
        setClaimed(true)
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim daily bonus",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClaimBonus}
      disabled={claimed || isLoading}
      className="w-full"
      variant={claimed ? "outline" : "default"}
    >
      <Gift className="mr-2 h-4 w-4" />
      {claimed ? "Daily Bonus Claimed" : isLoading ? "Claiming..." : "Claim Daily Bonus (5 Credits)"}
    </Button>
  )
}
