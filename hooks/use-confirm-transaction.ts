import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey, Connection, TransactionSignature } from '@solana/web3.js';
import { useToast } from "@/components/ui/use-toast";

export const useConfirmTransaction = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { toast } = useToast();

  const confirmTransaction = useCallback(async (
    transaction: Transaction,
    feePayer: PublicKey,
    description: string
  ): Promise<TransactionSignature | null> => {
    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to confirm the transaction.",
        variant: "destructive",
      });
      return null;
    }

    setIsConfirming(true);

    try {
      transaction.feePayer = feePayer;
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());

      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }

      toast({
        title: "Transaction Confirmed",
        description: `${description} - Signature: ${signature}`,
      });

      return signature;
    } catch (error) {
      console.error('Transaction confirmation error:', error);
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to confirm transaction. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsConfirming(false);
    }
  }, [connection, publicKey, signTransaction, toast]);

  const retryTransaction = useCallback(async (
    signature: TransactionSignature,
    maxRetries: number = 3
  ): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await connection.getSignatureStatus(signature);
        if (result.value?.confirmationStatus === 'confirmed' || result.value?.confirmationStatus === 'finalized') {
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      } catch (error) {
        console.error(`Retry attempt ${i + 1} failed:`, error);
      }
    }
    return false;
  }, [connection]);

  return { confirmTransaction, isConfirming, retryTransaction };
};

