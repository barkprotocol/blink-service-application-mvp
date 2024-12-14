import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey, Connection } from '@solana/web3.js';
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
  ) => {
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
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());

      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

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

  return { confirmTransaction, isConfirming };
};

