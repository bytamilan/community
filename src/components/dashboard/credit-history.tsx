import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface CreditTransaction {
  id: string
  amount: number
  description: string
  created_at: string
}

interface CreditHistoryProps {
  transactions: CreditTransaction[]
}

export function CreditHistory({ transactions }: CreditHistoryProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Credit History</CardTitle>
        <CardDescription>Your recent credit transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                  </div>
                </div>
                <div className={`font-medium ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">No credit transactions yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
