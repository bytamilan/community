import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DailyBonusButton } from "@/components/daily-bonus-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreditCard, TrendingUp, History, AlertCircle } from "lucide-react"

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect if not logged in
  if (!session) {
    redirect("/auth/login")
  }

  const profile = await getProfile(session.user.id)

  if (!profile) {
    return <div>Error loading profile</div>
  }

  // Get credit transactions
  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Check if user has claimed daily bonus today
  const today = new Date().toISOString().split("T")[0]
  const hasClaimedToday = transactions?.some(
    (t) => t.description === "Daily login bonus" && t.created_at.split("T")[0] === today,
  )

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Credits</h1>

      {searchParams.message && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Credit Requirement</AlertTitle>
          <AlertDescription>{searchParams.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Available Credits</CardTitle>
            <CardDescription>Your current credit balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 mr-3 text-primary" />
              <div className="text-3xl font-bold">{profile.credits}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Earn More Credits</CardTitle>
            <CardDescription>Ways to increase your balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              <span>Create valuable posts and receive upvotes</span>
            </div>
            <DailyBonusButton hasClaimedToday={hasClaimedToday} />
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    <History className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">No transactions yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
