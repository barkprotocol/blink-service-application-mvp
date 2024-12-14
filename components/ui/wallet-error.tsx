import React from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

interface WalletErrorProps {
  error: Error
}

export function WalletError({ error }: WalletErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.message || 'An unexpected error occurred while connecting to the wallet.'}
      </AlertDescription>
    </Alert>
  )
}

