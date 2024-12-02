import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ArrowUpRight } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Transaction {
  id: string
  recipient: string
  amount: number
  timestamp: Date
}

interface PaymentHistoryProps {
  transactions: Transaction[]
  isLoading: boolean
}

export function PaymentHistory({ transactions, isLoading }: PaymentHistoryProps) {
  return (
    <Card className="w-full bg-white shadow-lg border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Recent Payments</CardTitle>
        <CardDescription>View your latest transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : transactions.length > 0 ? (
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Recipient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">
                      {tx.recipient.slice(0, 4)}...{tx.recipient.slice(-4)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        {tx.amount.toFixed(4)} SOL
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <span className="mr-2">{tx.timestamp.toLocaleString()}</span>
                        <a
                          href={`https://explorer.solana.com/tx/${tx.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="sr-only">View transaction on Solana Explorer</span>
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found. Start making payments to see your history.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

